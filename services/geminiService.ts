import { GoogleGenAI } from "@google/genai";
import { CoachingSession, ChecklistItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoachingFeedback = async (
  session: CoachingSession,
  config: ChecklistItem[]
): Promise<string> => {
  const scoresText = config.map(i => `${i.task}: ${session.scores[i.id] || 0}/${i.maxPoints} ${i.isBonus ? '(Bonus)' : ''}`).join('\n');
  const commentsText = session.categoryComments ? Object.entries(session.categoryComments).map(([k,v]) => `${k} observations: ${v}`).join('\n') : "";

  const prompt = `
    Analyze this Dyson Demo Excellence Audit.
    Specialist: ${session.staffName}
    Ref: ${session.auditReference}

    SCORING CONTEXT:
    Target base: 100 points. Total Earned: ${session.totalScore} / 100 (Base)

    DETAIL SCORES:
    ${scoresText}

    SUPERVISOR QUALITATIVE NOTES:
    Series-level: ${commentsText}
    Overall Summary: ${session.overallComment}

    Generate a premium coaching feedback report following these sections:
    1. CELEBRATION: Praise specific strengths and bonus achievements.
    2. REFINEMENT: Identify 2 "Dyson Techniques" to sharpen.
    3. ACTION PLAN: 3 clear talking points for their next floor shift.
    
    TONE: Professional, analytical, and supportive SEA Retail style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Analysis generated. Review manual ledger.";
  } catch (error) {
    console.error(error);
    return "AI generation limited. Use score ledger for manual coaching.";
  }
};

export const generateTNAReport = async (
  sessions: CoachingSession[],
  config: ChecklistItem[]
): Promise<string> => {
  if (sessions.length === 0) return "No data available for analysis.";

  // 1. Pre-calculate Aggregate Data for the AI to ensure accuracy
  const pillarPerformance: Record<string, { total: number; count: number; max: number }> = {};
  const taskAverages: Record<string, { earned: number; possible: number; task: string }> = {};

  sessions.forEach(s => {
    config.forEach(item => {
      const prefix = item.category.split(':')[0] || 'Misc';
      if (!pillarPerformance[prefix]) pillarPerformance[prefix] = { total: 0, count: 0, max: 0 };
      
      const score = s.scores[item.id] || 0;
      pillarPerformance[prefix].total += score;
      pillarPerformance[prefix].count++;
      pillarPerformance[prefix].max += item.maxPoints;

      if (!taskAverages[item.id]) taskAverages[item.id] = { earned: 0, possible: 0, task: item.task };
      taskAverages[item.id].earned += score;
      taskAverages[item.id].possible += item.maxPoints;
    });
  });

  const pillarStats = Object.entries(pillarPerformance).map(([name, data]) => 
    `${name}: ${Math.round((data.total / data.max) * 100)}% Proficiency`
  ).join('\n');

  const sortedGaps = Object.values(taskAverages)
    .map(t => ({ ...t, perc: (t.earned / t.possible) * 100 }))
    .sort((a, b) => a.perc - b.perc)
    .slice(0, 5);

  const gapsText = sortedGaps.map(g => `- ${g.task}: ${Math.round(g.perc)}% avg score`).join('\n');

  const prompt = `
    Dyson Training Needs Analysis (TNA) - SEA Regional Hub Report
    Total Audits Analyzed: ${sessions.length}

    AGGREGATE PILLAR DATA:
    ${pillarStats}

    TOP 5 SKILL GAPS (Lowest Proficiency):
    ${gapsText}

    TASK:
    Generate a high-level strategic Training Needs Analysis.
    Structure the response using these Markdown headers:
    ### EXECUTIVE SUMMARY
    ### PILLAR PERFORMANCE ANALYSIS (S1-S5)
    ### CRITICAL GAPS & TRENDS
    ### 30-DAY STRATEGIC ACTION PLAN

    FOCUS: Identify the specific Dyson Pillar needing immediate intervention and provide 3 concrete steps for trainers to take in the field.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Analysis complete. Review ledger metrics.";
  } catch (error) {
    console.error("TNA Error:", error);
    return "Failed to analyze trends. Please check Hub connectivity.";
  }
};