export interface Repo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  fork: boolean;
  updated_at: string;
}

export interface UserProfile {
  login: string;
  avatar_url: string;
  name: string;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface ActivityStats {
  totalCommits: number; // This will now represent Total Contributions (Commits + Issues + PRs) from the graph
  totalPRs: number; // Still estimated from recent events or separate fetch
  totalIssues: number; // Still estimated
  longestStreak: number;
  activeDays: number;
  topLanguages: { name: string; count: number; percentage: number; color: string }[];
  busiestDay: string; // "Monday"
  busiestTimeOfDay: string; // "Late Night"
  peakHour: number;
  contributionGrid: { date: string; count: number; level: number }[]; // Real data
  year: number;
}

export interface GeminiInsights {
  archetype: string;
  archetypeDescription: string;
  motivationalMessage: string;
  zoneDescription: string;
}

export interface WrappedData {
  user: UserProfile;
  repos: Repo[];
  stats: ActivityStats;
  insights: GeminiInsights | null;
}

export enum AppState {
  INPUT,
  LOADING,
  PLAYING,
  SUMMARY,
  EASTER_EGG
}

export interface SlideProps {
  data: WrappedData;
  onNext: () => void;
  onPrev?: () => void;
  active: boolean;
  onRestart?: () => void;
}