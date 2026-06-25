import { useMemo, useState } from "react";
import {
  buildCommissionPlayerHeatmap,
  buildPlayerOptions,
  buildStoryVolumeHeatmap,
  getLeaderboardStats,
} from "../heatmapData";
import type { LeaderboardsData, StageNavTarget, StagesData } from "../types";
import { isCommissionStage, isStoryStage } from "../types";
import { HeatmapGrid } from "./HeatmapGrid";
import { SearchableSelect } from "./SearchableSelect";
import { VizSummary } from "./VizSummary";

interface Props {
  storyBoards: LeaderboardsData | null;
  commissionBoards: LeaderboardsData | null;
  storyStages: StagesData | null;
  commissionStages: StagesData | null;
  onNavigateToStage: (target: StageNavTarget) => void;
}

export function IndividualDataViz({
  storyBoards,
  commissionBoards,
  storyStages,
  commissionStages,
  onNavigateToStage,
}: Props) {
  const playerOptions = useMemo(
    () => buildPlayerOptions(storyBoards, commissionBoards),
    [storyBoards, commissionBoards],
  );

  const [playerName, setPlayerName] = useState("");
  const [showValues, setShowValues] = useState(false);

  const effectivePlayer =
    playerName && playerOptions.some((o) => o.value === playerName)
      ? playerName
      : (playerOptions[0]?.value ?? "");

  const storyStageList = useMemo(
    () => (storyStages?.stages ?? []).filter(isStoryStage),
    [storyStages],
  );

  const commissionStageList = useMemo(
    () => (commissionStages?.stages ?? []).filter(isCommissionStage),
    [commissionStages],
  );

  const volumes = useMemo(
    () => [...new Set(storyStageList.map((s) => s.volume))].sort((a, b) => a - b),
    [storyStageList],
  );

  const storyStats = getLeaderboardStats(storyBoards, effectivePlayer, "name");
  const commissionStats = getLeaderboardStats(commissionBoards, effectivePlayer, "name");

  if (playerOptions.length === 0) {
    return <div className="empty-state">Player data not available yet.</div>;
  }

  return (
    <div className="individual-data-viz">
      <div className="data-viz-controls">
        <SearchableSelect
          label="Username"
          value={effectivePlayer}
          options={playerOptions}
          onChange={setPlayerName}
        />
        <label className="viz-toggle">
          <input
            type="checkbox"
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
          />
          Show values
        </label>
      </div>

      <section className="data-viz-section">
        <h2 className="section-title">Story</h2>
        <VizSummary stats={storyStats} />
        {volumes.map((vol) => {
          const heatmapData = buildStoryVolumeHeatmap(storyStageList, vol, effectivePlayer);
          return (
            <HeatmapGrid
              key={vol}
              data={heatmapData}
              showValues={showValues}
              twoRowHeaders
              onCellClick={onNavigateToStage}
            />
          );
        })}
      </section>

      <section className="data-viz-section">
        <h2 className="section-title">Commissions</h2>
        <VizSummary stats={commissionStats} />
        <HeatmapGrid
          data={buildCommissionPlayerHeatmap(commissionStageList, effectivePlayer)}
          showValues={showValues}
          onCellClick={onNavigateToStage}
        />
      </section>
    </div>
  );
}
