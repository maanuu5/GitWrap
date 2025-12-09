import { ActivityStats, Repo, UserProfile } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const CONTRIBUTIONS_API_BASE = 'https://github-contributions-api.jogruber.de/v4';

// Helper to handle API limits roughly
async function fetchWithFallback(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 403) throw new Error("API Rate Limit Exceeded. Try again later.");
    if (response.status === 404) throw new Error("User/Resource not found.");
    console.warn(`Fetch failed for ${url}: ${response.statusText}`);
    return null; // Return null to handle gracefully
  }
  return response.json();
}

export async function fetchGithubData(username: string): Promise<{ user: UserProfile; repos: Repo[]; events: any[]; contributions: any; year: number }> {
  const now = new Date();
  // If it's January, default to the previous year for a full "Wrapped" experience
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  // Parallel fetch for efficiency
  const [user, repos, events, contributions] = await Promise.all([
    fetchWithFallback(`${GITHUB_API_BASE}/users/${username}`),
    fetchWithFallback(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`),
    fetchWithFallback(`${GITHUB_API_BASE}/users/${username}/events?per_page=100`),
    fetchWithFallback(`${CONTRIBUTIONS_API_BASE}/${username}?y=${year}`)
  ]);

  if (!user) throw new Error("User not found.");

  return { 
    user, 
    repos: repos || [], 
    events: events || [], 
    contributions: contributions || { total: {}, contributions: [] },
    year 
  };
}

export function processStats(repos: Repo[], events: any[], contributionsData: any, year: number): ActivityStats {
  let totalPRs = 0;
  let totalIssues = 0;
  
  // 1. Process Events for "The Zone" (Time of Day) and Activity Ratios
  // Note: Events API only returns last 90 days, so these are estimates for "Recent Behavior"
  const hourCounts: Record<number, number> = {};
  
  events.forEach((event: any) => {
    const date = new Date(event.created_at);
    const hour = date.getHours();

    // Track hours
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    if (event.type === 'PullRequestEvent' && event.payload.action === 'opened') {
      totalPRs++;
    } else if (event.type === 'IssuesEvent' && event.payload.action === 'opened') {
      totalIssues++;
    }
  });

  // 2. Process Contributions Graph (Accurate Yearly Stats)
  const dailyContributions: { date: string; count: number; level: number }[] = contributionsData.contributions || [];
  const totalCommits = contributionsData.total?.[year] || 0; // This is actually total contributions

  // Calculate Streak & Active Days from the full year graph
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  
  const dayCounts: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  dailyContributions.forEach(day => {
    if (day.count > 0) {
      activeDays++;
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      
      // Determine day of week for this contribution
      const dateObj = new Date(day.date);
      // Fix timezone issue where Date parse might default to UTC midnight and shift day locally
      // We append T12:00:00 to ensure we get the correct weekday
      const localDate = new Date(day.date + 'T12:00:00'); 
      const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + day.count;
    } else {
      currentStreak = 0;
    }
  });

  // 3. Process Repos for Palette (Languages)
  const languageCounts: Record<string, number> = {};
  repos.forEach((repo: Repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const totalReposWithLang = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalReposWithLang > 0 ? Math.round((count / totalReposWithLang) * 100) : 0,
      color: getLanguageColor(name)
    }));

  // 4. Find Peak Hour (from recent events)
  let peakHour = 12;
  let maxHourCount = 0;
  Object.entries(hourCounts).forEach(([h, c]) => {
    if (c > maxHourCount) {
      maxHourCount = c;
      peakHour = parseInt(h);
    }
  });

  // 5. Find Favorite Day (from full year data)
  let busiestDay = "Monday";
  let maxDayCount = 0;
  Object.entries(dayCounts).forEach(([d, c]) => {
    if (c > maxDayCount) {
      maxDayCount = c;
      busiestDay = d;
    }
  });

  // Estimate Time of Day
  let busiestTimeOfDay = "Day Walker";
  if (peakHour >= 5 && peakHour < 12) busiestTimeOfDay = "Early Bird";
  else if (peakHour >= 12 && peakHour < 17) busiestTimeOfDay = "Afternoon Focus";
  else if (peakHour >= 17 && peakHour < 22) busiestTimeOfDay = "Evening Hustler";
  else busiestTimeOfDay = "Night Owl";

  // Reverse the grid to show most recent at the end, but usually we want Jan -> Dec. 
  // API returns Jan -> Dec.
  
  return {
    totalCommits, // Accurately represents Total Contributions
    totalPRs: totalPRs || Math.round(totalCommits * 0.05), // Fallback estimate if 0 events found but commits exist
    totalIssues: totalIssues || Math.round(totalCommits * 0.02), // Fallback estimate
    longestStreak,
    activeDays,
    topLanguages,
    busiestDay,
    busiestTimeOfDay,
    peakHour,
    contributionGrid: dailyContributions,
    year
  };
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Vue: '#41b883',
    React: '#61dafb',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    PHP: '#4F5D95',
    Ruby: '#701516',
    'C#': '#178600',
    'C++': '#f34b7d',
    C: '#555555',
    Shell: '#89e051'
  };
  return colors[lang] || '#cccccc';
}