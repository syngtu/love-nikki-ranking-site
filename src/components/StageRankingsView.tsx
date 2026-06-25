import { useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  CommissionStageData,
  StageData,
  StagesData,
  StoryStageData,
} from "../types";
import { isCommissionStage, isStoryStage } from "../types";
import { formatScore } from "../data";
import {
  buildAppUrlSearch,
  mergeAppUrlState,
  parseAppUrlState,
  type CommissionStageParams,
  type StoryStageParams,
} from "../urlState";

interface Props {
  data: StagesData | null;
  showGuild?: boolean;
}

function rankRowClass(rank: number): string {
  if (rank === 1) return "rank-row-top1";
  if (rank === 2) return "rank-row-top2";
  if (rank === 3) return "rank-row-top3";
  return "";
}

function _roman(n: number): string {
  const numerals: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
  };
  return numerals[n] ?? String(n);
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getDefaultStoryStage(stages: StoryStageData[]): StoryStageParams | null {
  const volume = [...new Set(stages.map((s) => s.volume))].sort((a, b) => a - b)[0];
  if (volume === undefined) return null;

  const chapter = [
    ...new Set(stages.filter((s) => s.volume === volume).map((s) => s.chapter)),
  ].sort((a, b) => a - b)[0];
  if (chapter === undefined) return null;

  for (const stageType of ["main", "side"] as const) {
    const stage = stages
      .filter(
        (s) => s.volume === volume && s.chapter === chapter && s.stage_type === stageType,
      )
      .map((s) => s.stage)
      .sort((a, b) => a - b)[0];
    if (stage !== undefined) {
      return { volume, chapter, stageType, stage };
    }
  }

  return null;
}

function getDefaultCommissionStage(stages: CommissionStageData[]): CommissionStageParams | null {
  const chapter = [...new Set(stages.map((s) => s.chapter))].sort((a, b) => a - b)[0];
  if (chapter === undefined) return null;

  const stage = stages
    .filter((s) => s.chapter === chapter)
    .map((s) => s.stage)
    .sort((a, b) => a - b)[0];
  if (stage === undefined) return null;

  return { chapter, stage };
}

function useStorySelection(stages: StoryStageData[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = parseAppUrlState(searchParams);

  const volumes = useMemo(
    () => [...new Set(stages.map((s) => s.volume))].sort((a, b) => a - b),
    [stages],
  );

  const defaults = useMemo(() => getDefaultStoryStage(stages), [stages]);
  const raw = urlState.storyStage ?? defaults;

  const effectiveVolume =
    raw && volumes.includes(raw.volume) ? raw.volume : (defaults?.volume ?? volumes[0] ?? 0);
  const volNum = effectiveVolume;

  const chapters = useMemo(
    () =>
      [...new Set(stages.filter((s) => s.volume === volNum).map((s) => s.chapter))].sort(
        (a, b) => a - b,
      ),
    [stages, volNum],
  );

  const effectiveChapter =
    raw && chapters.includes(raw.chapter) ? raw.chapter : (defaults?.chapter ?? chapters[0] ?? 0);
  const chapterNum = effectiveChapter;

  const stageOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string; stageType: "main" | "side"; stage: number }[] =
      [];
    for (const type of ["main", "side"] as const) {
      const nums = [
        ...new Set(
          stages
            .filter(
              (s) =>
                s.volume === volNum && s.chapter === chapterNum && s.stage_type === type,
            )
            .map((s) => s.stage),
        ),
      ].sort((a, b) => a - b);
      for (const n of nums) {
        const value = `${type}:${n}`;
        if (seen.has(value)) continue;
        seen.add(value);
        opts.push({
          value,
          label: type === "side" ? `S${n}` : `${n}`,
          stageType: type,
          stage: n,
        });
      }
    }
    return opts;
  }, [stages, volNum, chapterNum]);

  const rawStageKey = raw ? `${raw.stageType}:${raw.stage}` : "";
  const effectiveStageKey = stageOptions.some((o) => o.value === rawStageKey)
    ? rawStageKey
    : (stageOptions[0]?.value ?? "");
  const selectedStageOption =
    stageOptions.find((o) => o.value === effectiveStageKey) ?? stageOptions[0];
  const effectiveStageType = selectedStageOption?.stageType ?? "main";
  const stageNum = selectedStageOption?.stage ?? 0;

  const setStoryStage = (next: StoryStageParams) => {
    setSearchParams(
      new URLSearchParams(
        buildAppUrlSearch(
          mergeAppUrlState(urlState, {
            tab: "story",
            view: "stages",
            storyStage: next,
          }),
        ),
      ),
    );
  };

  const selectedStages = useMemo(
    () =>
      (["maiden", "princess"] as const)
        .map((difficulty) =>
          stages.find(
            (s) =>
              s.volume === volNum &&
              s.chapter === chapterNum &&
              s.stage_type === effectiveStageType &&
              s.stage === stageNum &&
              s.difficulty === difficulty,
          ),
        )
        .filter((s): s is StoryStageData => Boolean(s)),
    [stages, volNum, chapterNum, effectiveStageType, stageNum],
  );

  return {
    selectedStages,
    selectors: (
      <div className="stage-selectors">
        <SelectField
          label="Volume"
          value={String(effectiveVolume)}
          onChange={(v) => {
            const nextVolume = Number(v);
            const nextChapters = [
              ...new Set(stages.filter((s) => s.volume === nextVolume).map((s) => s.chapter)),
            ].sort((a, b) => a - b);
            const nextChapter = nextChapters[0] ?? 0;
            const nextOption = stages.find(
              (s) => s.volume === nextVolume && s.chapter === nextChapter,
            );
            setStoryStage({
              volume: nextVolume,
              chapter: nextChapter,
              stageType: nextOption?.stage_type ?? "main",
              stage: nextOption?.stage ?? 1,
            });
          }}
          options={volumes.map((v) => ({ value: String(v), label: `${_roman(v)}` }))}
        />
        <SelectField
          label="Chapter"
          value={String(effectiveChapter)}
          onChange={(v) => {
            const nextChapter = Number(v);
            const nextOption = stages.find(
              (s) => s.volume === volNum && s.chapter === nextChapter,
            );
            setStoryStage({
              volume: volNum,
              chapter: nextChapter,
              stageType: nextOption?.stage_type ?? "main",
              stage: nextOption?.stage ?? 1,
            });
          }}
          options={chapters.map((c) => ({ value: String(c), label: `${c}` }))}
        />
        <SelectField
          label="Stage"
          value={effectiveStageKey}
          onChange={(v) => {
            const option = stageOptions.find((o) => o.value === v);
            if (!option) return;
            setStoryStage({
              volume: volNum,
              chapter: chapterNum,
              stageType: option.stageType,
              stage: option.stage,
            });
          }}
          options={stageOptions.map((o) => ({ value: o.value, label: o.label }))}
        />
      </div>
    ),
  };
}

function useCommissionSelection(stages: CommissionStageData[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = parseAppUrlState(searchParams);

  const chapters = useMemo(
    () => [...new Set(stages.map((s) => s.chapter))].sort((a, b) => a - b),
    [stages],
  );

  const defaults = useMemo(() => getDefaultCommissionStage(stages), [stages]);
  const raw = urlState.commissionStage ?? defaults;

  const effectiveChapter =
    raw && chapters.includes(raw.chapter) ? raw.chapter : (defaults?.chapter ?? chapters[0] ?? 0);
  const chapterNum = effectiveChapter;

  const stageNums = useMemo(
    () =>
      stages
        .filter((s) => s.chapter === chapterNum)
        .map((s) => s.stage)
        .sort((a, b) => a - b),
    [stages, chapterNum],
  );

  const effectiveStageNum =
    raw && stageNums.includes(raw.stage) ? raw.stage : (stageNums[0] ?? 0);
  const stageNum = effectiveStageNum;

  const setCommissionStage = (next: CommissionStageParams) => {
    setSearchParams(
      new URLSearchParams(
        buildAppUrlSearch(
          mergeAppUrlState(urlState, {
            tab: "commission",
            view: "stages",
            commissionStage: next,
          }),
        ),
      ),
    );
  };

  const selectedStages = useMemo(() => {
    const found = stages.find((s) => s.chapter === chapterNum && s.stage === stageNum);
    return found ? [found] : [];
  }, [stages, chapterNum, stageNum]);

  return {
    selectedStages,
    selectors: (
      <div className="stage-selectors">
        <SelectField
          label="Chapter"
          value={String(effectiveChapter)}
          onChange={(v) => {
            const nextChapter = Number(v);
            const nextStage =
              stages
                .filter((s) => s.chapter === nextChapter)
                .map((s) => s.stage)
                .sort((a, b) => a - b)[0] ?? 0;
            setCommissionStage({ chapter: nextChapter, stage: nextStage });
          }}
          options={chapters.map((c) => ({ value: String(c), label: `${c}` }))}
        />
        <SelectField
          label="Stage"
          value={String(effectiveStageNum)}
          onChange={(v) => setCommissionStage({ chapter: chapterNum, stage: Number(v) })}
          options={stageNums.map((s) => ({ value: String(s), label: `${s}` }))}
        />
      </div>
    ),
  };
}

function StoryStageRankings({ stages }: { stages: StoryStageData[] }) {
  const { selectedStages, selectors } = useStorySelection(stages);
  return <StageRankingsContent selectedStages={selectedStages} selectors={selectors} />;
}

function CommissionStageRankings({
  stages,
  showGuild,
}: {
  stages: CommissionStageData[];
  showGuild: boolean;
}) {
  const { selectedStages, selectors } = useCommissionSelection(stages);
  return (
    <StageRankingsContent
      selectedStages={selectedStages}
      selectors={selectors}
      showGuild={showGuild}
    />
  );
}

function StageRankingsContent({
  selectedStages,
  selectors,
  showGuild = false,
}: {
  selectedStages: StageData[];
  selectors: ReactNode;
  showGuild?: boolean;
}) {
  return (
    <>
      {selectors}
      <div className="stage-card-grid">
        {selectedStages.map((stage) => (
          <div className="card stage-card" key={stage.label}>
            <div className="card-header">
              <h3>{stage.label}</h3>
            </div>
            <table className="stage-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  {showGuild && <th>Guild</th>}
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {stage.entries.map((entry) => (
                  <tr key={entry.rank} className={rankRowClass(entry.rank)}>
                    <td>{entry.rank}</td>
                    <td className="player-name">{entry.name}</td>
                    {showGuild && (
                      <td className={entry.guild ? "player-name" : "player-name guild-none"}>
                        {entry.guild || "Not in guild"}
                      </td>
                    )}
                    <td className="score">{formatScore(entry.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}

export function StageRankingsView({ data, showGuild = false }: Props) {
  const stages = data?.stages ?? [];
  const storyStages = stages.filter(isStoryStage);
  const commissionStages = stages.filter(isCommissionStage);

  if (!data || stages.length === 0) {
    return <div className="empty-state">Stage ranking data not available yet.</div>;
  }

  if (showGuild) {
    return <CommissionStageRankings stages={commissionStages} showGuild />;
  }

  return <StoryStageRankings stages={storyStages} />;
}
