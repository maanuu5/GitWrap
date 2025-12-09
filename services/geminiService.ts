import { GoogleGenAI, Type } from "@google/genai";
import { ActivityStats, GeminiInsights, UserProfile } from '../types';

export async function generateGeminiInsights(
  user: UserProfile, 
  stats: ActivityStats,
  mostStarredRepo: string
): Promise<GeminiInsights> {
  
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return {
      archetype: " The Mystery",
      archetypeDescription: "We couldn't analyze your data deeply, but you code with purpose.",
      motivationalMessage: "Keep building amazing things.",
      zoneDescription: "You find your flow when it matters most."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze this GitHub developer profile:
    Username: ${user.login}
    Total Commits (Recent): ${stats.totalCommits}
    Top Languages: ${stats.topLanguages.map(l => l.name).join(', ')}
    Peak Coding Hour: ${stats.peakHour}:00
    Most Active Day: ${stats.busiestDay}
    Most Starred Repo: ${mostStarredRepo}
    
    Based on this, generate a JSON response with:
    1. 'archetype': A creative 2-3 word title for their coding personality (e.g., "The Night Architect", "The Python Sorcerer").
    2. 'archetypeDescription': A 1-sentence description of why this fits them.
    3. 'motivationalMessage': A short, inspiring quote about their impact (max 15 words).
    4. 'zoneDescription': A 1-sentence comment on their coding time/day habits.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            archetypeDescription: { type: Type.STRING },
            motivationalMessage: { type: Type.STRING },
            zoneDescription: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as GeminiInsights;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      archetype: "The Code Artisan",
      archetypeDescription: "You craft logic with consistency and flair.",
      motivationalMessage: "Your code is shaping the future, one commit at a time.",
      zoneDescription: "You own your schedule and deliver when it counts."
    };
  }
}
