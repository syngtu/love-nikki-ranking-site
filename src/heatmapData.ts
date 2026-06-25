import {
  guildPointsColor,
  guildRankCountColor,
  HEATMAP_COLORS,
  rankColor,
} from "./heatmap";
import type {
  CommissionStageData,
  LeaderboardsData,
  StageEntry,
  StageNavTarget,
  StoryStageData,
} from "./types";

export type HeatmapCellState = "nonexistent" | "unranked" | "ranked";

export interface HeatmapCell {
  state: HeatmapCellState;
  value?: number;
  color: string;
  navTarget?: StageNavTarget;
}

export interface HeatmapColumnHeader {
  label: string;
  subLabel?: string;
}

export interface HeatmapGridData {
  rowLabels: string[];
  columnHeaders: HeatmapColumnHeader[];
  cells: HeatmapCell[];
  cornerLabel?: string;
}

function findPlayerRank(entries: StageEntry[], playerName: string): number | undefined {
  const entry = entries.find((e) => e.name === playerName);
  return entry?.rank;
}

function storyStageKey(
  volume: number,
  chapter: number,
  stageType: "main" | "side",
  stage: number,
  difficulty: "maiden" | "princess",
): string {
  return `${volume}:${chapter}:${stageType}:${stage}:${difficulty}`;
}

function buildStoryStageMap(stages: StoryStageData[]): Map<string, StoryStageData> {
  const map = new Map<string, StoryStageData>();
  for (const s of stages) {
    map.set(
      storyStageKey(s.volume, s.chapter, s.stage_type, s.stage, s.difficulty),
      s,
    );
  }
  return map;
}

function volumeRoman(volume: number): string {
  const numerals: Record<number, string> = { 1: "I", 2: "II", 3: "III" };
  return numerals[volume] ?? String(volume);
}

export function buildStoryVolumeHeatmap(
  stages: StoryStageData[],
  volume: number,
  playerName: string,
): HeatmapGridData {
  const volStages = stages.filter((s) => s.volume === volume);
  const stageMap = buildStoryStageMap(volStages);

  const chapters = [...new Set(volStages.map((s) => s.chapter))].sort((a, b) => a - b);

  let maxMain = 0;
  let maxSide = 0;
  for (const ch of chapters) {
    const main = volStages.filter((s) => s.chapter === ch && s.stage_type === "main");
    const side = volStages.filter((s) => s.chapter === ch && s.stage_type === "side");
    maxMain = Math.max(
      maxMain,
      ...main.map((s) => s.stage),
      0,
    );
    maxSide = Math.max(
      maxSide,
      ...side.map((s) => s.stage),
      0,
    );
  }

  const rowLabels: string[] = [];
  for (let i = 1; i <= maxMain; i++) rowLabels.push(String(i));
  for (let i = 1; i <= maxSide; i++) rowLabels.push(`s${i}`);

  const columnHeaders: HeatmapColumnHeader[] = [];
  for (const chapter of chapters) {
    columnHeaders.push({ label: String(chapter), subLabel: "M" });
    columnHeaders.push({ label: "", subLabel: "P" });
  }

  const cells: HeatmapCell[] = [];

  for (const rowLabel of rowLabels) {
    const isSide = rowLabel.startsWith("s");
    const stageType: "main" | "side" = isSide ? "side" : "main";
    const stageNum = isSide ? Number(rowLabel.slice(1)) : Number(rowLabel);

    for (const chapter of chapters) {
      for (const difficulty of ["maiden", "princess"] as const) {
        const key = storyStageKey(volume, chapter, stageType, stageNum, difficulty);
        const stageData = stageMap.get(key);

        if (!stageData) {
          cells.push({
            state: "nonexistent",
            color: HEATMAP_COLORS.nonexistent,
          });
          continue;
        }

        const rank = findPlayerRank(stageData.entries, playerName);
        if (rank === undefined) {
          cells.push({
            state: "unranked",
            color: HEATMAP_COLORS.unranked,
            navTarget: {
              mode: "story",
              volume,
              chapter,
              stageType,
              stage: stageNum,
              difficulty,
            },
          });
        } else {
          cells.push({
            state: "ranked",
            value: rank,
            color: rankColor(rank),
            navTarget: {
              mode: "story",
              volume,
              chapter,
              stageType,
              stage: stageNum,
              difficulty,
            },
          });
        }
      }
    }
  }

  return {
    rowLabels,
    columnHeaders,
    cells,
    cornerLabel: `Volume ${volumeRoman(volume)}`,
  };
}

export function buildCommissionPlayerHeatmap(
  stages: CommissionStageData[],
  playerName: string,
): HeatmapGridData {
  const chapters = [...new Set(stages.map((s) => s.chapter))].sort((a, b) => a - b);
  const maxStage = 7;

  const stageMap = new Map<string, CommissionStageData>();
  for (const s of stages) {
    stageMap.set(`${s.chapter}:${s.stage}`, s);
  }

  const rowLabels = Array.from({ length: maxStage }, (_, i) => String(i + 1));
  const columnHeaders = chapters.map((c) => ({ label: String(c) }));

  const cells: HeatmapCell[] = [];

  for (let stage = 1; stage <= maxStage; stage++) {
    for (const chapter of chapters) {
      const stageData = stageMap.get(`${chapter}:${stage}`);
      if (!stageData) {
        cells.push({
          state: "nonexistent",
          color: HEATMAP_COLORS.nonexistent,
        });
        continue;
      }

      const rank = findPlayerRank(stageData.entries, playerName);
      if (rank === undefined) {
        cells.push({
          state: "unranked",
          color: HEATMAP_COLORS.unranked,
          navTarget: { mode: "commission", chapter, stage },
        });
      } else {
        cells.push({
          state: "ranked",
          value: rank,
          color: rankColor(rank),
          navTarget: { mode: "commission", chapter, stage },
        });
      }
    }
  }

  return { rowLabels, columnHeaders, cells };
}

export type GuildHeatmapMode = "points" | "ranks";

export function buildGuildCommissionHeatmap(
  stages: CommissionStageData[],
  guildName: string,
  mode: GuildHeatmapMode,
): HeatmapGridData {
  const chapters = [...new Set(stages.map((s) => s.chapter))].sort((a, b) => a - b);
  const maxStage = 7;

  const stageMap = new Map<string, CommissionStageData>();
  for (const s of stages) {
    stageMap.set(`${s.chapter}:${s.stage}`, s);
  }

  const rowLabels = Array.from({ length: maxStage }, (_, i) => String(i + 1));
  const columnHeaders = chapters.map((c) => ({ label: String(c) }));

  const cells: HeatmapCell[] = [];

  for (let stage = 1; stage <= maxStage; stage++) {
    for (const chapter of chapters) {
      const stageData = stageMap.get(`${chapter}:${stage}`);
      if (!stageData) {
        cells.push({
          state: "nonexistent",
          color: HEATMAP_COLORS.nonexistent,
        });
        continue;
      }

      const guildEntries = stageData.entries.filter((e) => e.guild === guildName);

      if (mode === "points") {
        const points = guildEntries.reduce((sum, e) => sum + (21 - e.rank), 0);
        cells.push({
          state: points > 0 ? "ranked" : "unranked",
          value: points,
          color: guildPointsColor(points),
          navTarget: { mode: "commission", chapter, stage },
        });
      } else {
        const count = guildEntries.length;
        cells.push({
          state: count > 0 ? "ranked" : "unranked",
          value: count,
          color: guildRankCountColor(count),
          navTarget: { mode: "commission", chapter, stage },
        });
      }
    }
  }

  return { rowLabels, columnHeaders, cells };
}

export interface LeaderboardStats {
  top1: number;
  top5: number;
  top10: number;
  top20: number;
  points: number;
  aggregateScore: number;
}

export function getLeaderboardStats(
  data: LeaderboardsData | null,
  name: string,
  nameKey: "name" | "guild" = "name",
): LeaderboardStats {
  const empty: LeaderboardStats = {
    top1: 0,
    top5: 0,
    top10: 0,
    top20: 0,
    points: 0,
    aggregateScore: 0,
  };
  if (!data) return empty;

  const find = (key: string) => {
    const board = data.leaderboards[key];
    if (!board) return undefined;
    return board.entries.find((e) => e[nameKey] === name);
  };

  return {
    top1: find("top_1")?.value ?? 0,
    top5: find("top_5")?.value ?? 0,
    top10: find("top_10")?.value ?? 0,
    top20: find("top_20")?.value ?? 0,
    points: find("points")?.value ?? 0,
    aggregateScore: find("aggregate_score")?.value ?? 0,
  };
}

export interface PlayerOption {
  value: string;
  label: string;
  combinedPoints: number;
}

export function buildPlayerOptions(
  storyBoards: LeaderboardsData | null,
  commissionBoards: LeaderboardsData | null,
): PlayerOption[] {
  const pointsMap = new Map<string, { story: number; commission: number }>();

  const addFromBoard = (data: LeaderboardsData | null, key: "story" | "commission") => {
    const board = data?.leaderboards.points;
    if (!board) return;
    for (const entry of board.entries) {
      const name = entry.name;
      if (!name) continue;
      const existing = pointsMap.get(name) ?? { story: 0, commission: 0 };
      existing[key] = entry.value;
      pointsMap.set(name, existing);
    }
  };

  addFromBoard(storyBoards, "story");
  addFromBoard(commissionBoards, "commission");

  return [...pointsMap.entries()]
    .map(([name, pts]) => ({
      value: name,
      label: name,
      combinedPoints: pts.story + pts.commission,
    }))
    .sort((a, b) => b.combinedPoints - a.combinedPoints);
}

export interface GuildMember {
  rank: number;
  name: string;
  points: number;
}

export function buildGuildMemberList(
  commissionBoards: LeaderboardsData | null,
  guildName: string,
): GuildMember[] {
  const board = commissionBoards?.leaderboards.points;
  if (!board) return [];

  const members = board.entries
    .filter((e) => e.guild === guildName && e.name)
    .map((e) => ({ name: e.name!, points: e.value }))
    .sort((a, b) => b.points - a.points);

  return members.map((m, i) => ({
    rank: i + 1,
    name: m.name,
    points: m.points,
  }));
}
