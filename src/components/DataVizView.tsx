import type { DataVizTab, LeaderboardsData, StageNavTarget, StagesData } from "../types";
import { IndividualDataViz } from "./IndividualDataViz";
import { GuildDataViz } from "./GuildDataViz";

interface Props {
  tab: DataVizTab;
  storyBoards: LeaderboardsData | null;
  commissionBoards: LeaderboardsData | null;
  guildBoards: LeaderboardsData | null;
  storyStages: StagesData | null;
  commissionStages: StagesData | null;
  onNavigateToStage: (target: StageNavTarget) => void;
}

export function DataVizView({
  tab,
  storyBoards,
  commissionBoards,
  guildBoards,
  storyStages,
  commissionStages,
  onNavigateToStage,
}: Props) {
  return (
    <>
      <div hidden={tab !== "individual"}>
        <IndividualDataViz
          storyBoards={storyBoards}
          commissionBoards={commissionBoards}
          storyStages={storyStages}
          commissionStages={commissionStages}
          onNavigateToStage={onNavigateToStage}
        />
      </div>
      <div hidden={tab !== "guild"}>
        <GuildDataViz
          commissionBoards={commissionBoards}
          guildBoards={guildBoards}
          commissionStages={commissionStages}
          onNavigateToStage={onNavigateToStage}
        />
      </div>
    </>
  );
}
