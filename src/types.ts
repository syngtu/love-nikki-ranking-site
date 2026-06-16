export interface LeaderboardEntry {
  rank: number;
  name?: string;
  guild?: string;
  value: number;
}

export interface Leaderboard {
  title: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardsData {
  mode: string;
  leaderboards: Record<string, Leaderboard>;
}

export interface StageEntry {
  rank: number;
  name: string;
  score: number;
  guild?: string;
}

export interface StoryStageData {
  task_id: string;
  label: string;
  volume: number;
  chapter: number;
  stage: number;
  stage_type: "main" | "side";
  difficulty: "maiden" | "princess";
  entries: StageEntry[];
}

export interface CommissionStageData {
  task_id: string;
  label: string;
  chapter: number;
  stage: number;
  entries: StageEntry[];
}

export type StageData = StoryStageData | CommissionStageData;

export interface StagesData {
  mode: string;
  stages: StageData[];
}

export interface MetaData {
  last_updated: string;
}

export type Mode = "story" | "commission";
export type View = "leaderboards" | "stages";

export const LEADERBOARD_KEYS = [
  "points",
  "aggregate_score",
  "top_20",
  "top_10",
  "top_5",
  "top_1",
] as const;

export type LeaderboardKey = (typeof LEADERBOARD_KEYS)[number];

export function isStoryStage(s: StageData): s is StoryStageData {
  return "volume" in s;
}

export function isCommissionStage(s: StageData): s is CommissionStageData {
  return "chapter" in s && !("volume" in s);
}
