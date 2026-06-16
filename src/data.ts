import type {
  LeaderboardsData,
  MetaData,
  Mode,
  StagesData,
} from "./types";

// Prefix with Vite's base path so fetches resolve under the GitHub Pages
// subpath (e.g. /love-nikki-ranking-lists/). BASE_URL always ends with "/".
const dataUrl = (file: string) => `${import.meta.env.BASE_URL}data/${file}`;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadMeta(): Promise<MetaData | null> {
  return fetchJson<MetaData>(dataUrl("meta.json"));
}

export async function loadLeaderboards(mode: Mode): Promise<LeaderboardsData | null> {
  return fetchJson<LeaderboardsData>(dataUrl(`${mode}_leaderboards.json`));
}

export async function loadGuildLeaderboards(): Promise<LeaderboardsData | null> {
  return fetchJson<LeaderboardsData>(dataUrl("commission_guild_leaderboards.json"));
}

export async function loadStages(mode: Mode): Promise<StagesData | null> {
  return fetchJson<StagesData>(dataUrl(`${mode}_stages.json`));
}

export function formatScore(value: number): string {
  return value.toLocaleString();
}
