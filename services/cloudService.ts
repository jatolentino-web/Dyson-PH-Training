
import { CoachingSession } from "../types";

const GLOBAL_STORAGE_KEY = 'dyson_global_hub_storage';

export const pushSessionToCloud = async (session: CoachingSession, workspaceId: string): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const globalData = JSON.parse(localStorage.getItem(GLOBAL_STORAGE_KEY) || '[]');
    
    // Ensure we don't duplicate by ID
    const exists = globalData.find((s: any) => s.id === session.id);
    if (!exists) {
      globalData.push({ ...session, workspaceId });
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(globalData));
    }
    return true;
  } catch (error) {
    console.error("Cloud Push Error:", error);
    return false;
  }
};

export const fetchSessionsFromCloud = async (workspaceId: string): Promise<CoachingSession[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const globalData = JSON.parse(localStorage.getItem(GLOBAL_STORAGE_KEY) || '[]');
    return globalData.filter((s: CoachingSession) => s.workspaceId === workspaceId);
  } catch (error) {
    console.error("Cloud Fetch Error:", error);
    return [];
  }
};
