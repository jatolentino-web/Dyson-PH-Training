
export enum AppView {
  SUPERVISOR = 'SUPERVISOR',
  TRAINER = 'TRAINER',
  CONFIG = 'CONFIG'
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  maxPoints: number;
  isBonus?: boolean;
}

export interface CoachingSession {
  id: string;
  staffName: string;
  supervisorName: string;
  storeBranch: string;
  auditReference: string;
  date: string;
  scores: Record<string, number>; // itemId -> score
  categoryComments?: Record<string, string>; // categoryPrefix -> comment
  overallComment?: string;
  totalScore: number;
  maxPossibleScore: number;
  aiFeedback?: string;
  workspaceId?: string;
}

export interface TNAData {
  category: string;
  averageScore: number;
  maxScore: number;
  gap: number;
}

export interface CloudSettings {
  enabled: boolean;
  workspaceId: string;
  lastSynced?: string;
}
