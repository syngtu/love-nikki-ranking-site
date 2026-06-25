import type { DataVizTab, Mode, StageNavTarget, View } from "./types";

export type StoryStageParams = {
  volume: number;
  chapter: number;
  stageType: "main" | "side";
  stage: number;
};

export type CommissionStageParams = {
  chapter: number;
  stage: number;
};

export type AppUrlState = {
  tab: Mode;
  view: View;
  viz: DataVizTab;
  storyStage: StoryStageParams | null;
  commissionStage: CommissionStageParams | null;
};

export const DEFAULT_APP_URL_STATE: AppUrlState = {
  tab: "story",
  view: "leaderboards",
  viz: "individual",
  storyStage: null,
  commissionStage: null,
};

const MODES: Mode[] = ["story", "commission", "dataviz", "about"];
const VIEWS: View[] = ["leaderboards", "stages"];
const VIZ_TABS: DataVizTab[] = ["individual", "guild"];
const STAGE_TYPES = ["main", "side"] as const;

function parseIntParam(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseAppUrlState(search: URLSearchParams | string): AppUrlState {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const tabParam = params.get("tab");
  const tab = MODES.includes(tabParam as Mode) ? (tabParam as Mode) : DEFAULT_APP_URL_STATE.tab;

  const viewParam = params.get("view");
  const view = VIEWS.includes(viewParam as View) ? (viewParam as View) : DEFAULT_APP_URL_STATE.view;

  const vizParam = params.get("viz");
  const viz = VIZ_TABS.includes(vizParam as DataVizTab)
    ? (vizParam as DataVizTab)
    : DEFAULT_APP_URL_STATE.viz;

  let storyStage: StoryStageParams | null = null;
  if (tab === "story") {
    const volume = parseIntParam(params.get("volume"));
    const chapter = parseIntParam(params.get("chapter"));
    const stageTypeParam = params.get("stageType");
    const stage = parseIntParam(params.get("stage"));
    if (
      volume !== null &&
      chapter !== null &&
      stage !== null &&
      STAGE_TYPES.includes(stageTypeParam as (typeof STAGE_TYPES)[number])
    ) {
      storyStage = {
        volume,
        chapter,
        stageType: stageTypeParam as "main" | "side",
        stage,
      };
    }
  }

  let commissionStage: CommissionStageParams | null = null;
  if (tab === "commission") {
    const chapter = parseIntParam(params.get("chapter"));
    const stage = parseIntParam(params.get("stage"));
    if (chapter !== null && stage !== null) {
      commissionStage = { chapter, stage };
    }
  }

  return { tab, view, viz, storyStage, commissionStage };
}

export function buildAppUrlSearch(state: AppUrlState): string {
  const params = new URLSearchParams();
  params.set("tab", state.tab);

  if (state.tab === "story" || state.tab === "commission") {
    params.set("view", state.view);
    if (state.view === "stages") {
      if (state.tab === "story" && state.storyStage) {
        params.set("volume", String(state.storyStage.volume));
        params.set("chapter", String(state.storyStage.chapter));
        params.set("stageType", state.storyStage.stageType);
        params.set("stage", String(state.storyStage.stage));
      } else if (state.tab === "commission" && state.commissionStage) {
        params.set("chapter", String(state.commissionStage.chapter));
        params.set("stage", String(state.commissionStage.stage));
      }
    }
  } else if (state.tab === "dataviz") {
    params.set("viz", state.viz);
  }

  return params.toString();
}

export function mergeAppUrlState(base: AppUrlState, patch: Partial<AppUrlState>): AppUrlState {
  return { ...base, ...patch };
}

export function toAppSearch(state: AppUrlState): string {
  const search = buildAppUrlSearch(state);
  return search ? `?${search}` : "";
}

export function stageNavTargetToAppUrlState(target: StageNavTarget): AppUrlState {
  if (target.mode === "story") {
    return {
      tab: "story",
      view: "stages",
      viz: "individual",
      storyStage: {
        volume: target.volume,
        chapter: target.chapter,
        stageType: target.stageType,
        stage: target.stage,
      },
      commissionStage: null,
    };
  }

  return {
    tab: "commission",
    view: "stages",
    viz: "individual",
    storyStage: null,
    commissionStage: {
      chapter: target.chapter,
      stage: target.stage,
    },
  };
}
