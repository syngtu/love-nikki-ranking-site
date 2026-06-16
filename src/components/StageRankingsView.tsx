import { useMemo, useState } from "react";
import type { CommissionStageData, StageData, StagesData, StoryStageData } from "../types";
import { isCommissionStage, isStoryStage } from "../types";
import { formatScore } from "../data";

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

function useStorySelection(stages: StoryStageData[]) {
  const volumes = useMemo(
    () => [...new Set(stages.map((s) => s.volume))].sort((a, b) => a - b),
    [stages],
  );

  const [volume, setVolume] = useState(volumes[0]?.toString() ?? "");
  const [chapter, setChapter] = useState("");
  const [stageKey, setStageKey] = useState("");

  const effectiveVolume =
    volume && volumes.includes(Number(volume)) ? volume : String(volumes[0] ?? "");
  const volNum = Number(effectiveVolume);
  const chapters = useMemo(
    () =>
      [...new Set(stages.filter((s) => s.volume === volNum).map((s) => s.chapter))].sort(
        (a, b) => a - b,
      ),
    [stages, volNum],
  );

  const effectiveChapter =
    chapter && chapters.includes(Number(chapter)) ? chapter : String(chapters[0] ?? "");
  const chapterNum = Number(effectiveChapter);

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

  const effectiveStageKey = stageOptions.some((o) => o.value === stageKey)
    ? stageKey
    : (stageOptions[0]?.value ?? "");
  const selectedStageOption =
    stageOptions.find((o) => o.value === effectiveStageKey) ?? stageOptions[0];
  const effectiveStageType = selectedStageOption?.stageType ?? "main";
  const stageNum = selectedStageOption?.stage ?? 0;

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
          value={effectiveVolume}
          onChange={(v) => {
            setVolume(v);
            setChapter("");
            setStageKey("");
          }}
          options={volumes.map((v) => ({ value: String(v), label: `${_roman(v)}` }))}
        />
        <SelectField
          label="Chapter"
          value={effectiveChapter}
          onChange={(v) => {
            setChapter(v);
            setStageKey("");
          }}
          options={chapters.map((c) => ({ value: String(c), label: `${c}` }))}
        />
        <SelectField
          label="Stage"
          value={effectiveStageKey}
          onChange={setStageKey}
          options={stageOptions.map((o) => ({ value: o.value, label: o.label }))}
        />
      </div>
    ),
  };
}

function useCommissionSelection(stages: CommissionStageData[]) {
  const chapters = useMemo(
    () => [...new Set(stages.map((s) => s.chapter))].sort((a, b) => a - b),
    [stages],
  );

  const [chapter, setChapter] = useState(String(chapters[0] ?? ""));
  const [stage, setStage] = useState("");

  const effectiveChapter =
    chapter && chapters.includes(Number(chapter)) ? chapter : String(chapters[0] ?? "");
  const chapterNum = Number(effectiveChapter);
  const stageNums = useMemo(
    () =>
      stages
        .filter((s) => s.chapter === chapterNum)
        .map((s) => s.stage)
        .sort((a, b) => a - b),
    [stages, chapterNum],
  );

  const effectiveStage = stage || String(stageNums[0] ?? "");
  const stageNum = Number(effectiveStage);

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
          value={effectiveChapter}
          onChange={(v) => {
            setChapter(v);
            setStage("");
          }}
          options={chapters.map((c) => ({ value: String(c), label: `${c}` }))}
        />
        <SelectField
          label="Stage"
          value={effectiveStage}
          onChange={setStage}
          options={stageNums.map((s) => ({ value: String(s), label: `${s}` }))}
        />
      </div>
    ),
  };
}

export function StageRankingsView({ data, showGuild = false }: Props) {
  const stages = data?.stages ?? [];
  const storyStages = stages.filter(isStoryStage);
  const commissionStages = stages.filter(isCommissionStage);

  const storySel = useStorySelection(storyStages);
  const commissionSel = useCommissionSelection(commissionStages);

  const selectedStages: StageData[] = showGuild
    ? commissionSel.selectedStages
    : storySel.selectedStages;
  const selectors = showGuild ? commissionSel.selectors : storySel.selectors;

  if (!data || stages.length === 0) {
    return <div className="empty-state">Stage ranking data not available yet.</div>;
  }

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
