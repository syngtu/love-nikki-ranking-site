import { LEADERBOARD_KEYS } from "../types";
import type { LeaderboardsData } from "../types";
import { LeaderboardCard } from "./LeaderboardCard";

interface Props {
  data: LeaderboardsData | null;
  nameKey?: "name" | "guild";
  title?: string;
  showGuildAffiliation?: boolean;
}

export function LeaderboardsView({
  data,
  nameKey = "name",
  title,
  showGuildAffiliation = false,
}: Props) {
  if (!data) {
    return <div className="empty-state">Leaderboard data not available yet.</div>;
  }

  return (
    <>
      {title && <h2 className="section-title">{title}</h2>}
      <div className="leaderboard-grid">
        {LEADERBOARD_KEYS.map((key) => {
          const board = data.leaderboards[key];
          if (!board) return null;
          return (
            <LeaderboardCard
              key={key}
              title={board.title}
              entries={board.entries}
              nameKey={nameKey}
              showGuildAffiliation={showGuildAffiliation}
            />
          );
        })}
      </div>
    </>
  );
}
