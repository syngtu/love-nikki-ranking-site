import type { LeaderboardEntry } from "../types";
import { formatScore } from "../data";

interface Props {
  title: string;
  entries: LeaderboardEntry[];
  nameKey?: "name" | "guild";
  showGuildAffiliation?: boolean;
}

const POINTS_INFO =
  "Points are awarded per stage ranking: rank 1 = 20 pts, rank 2 = 19 pts, … rank 20 = 1 pt.";

function rankRowClass(rank: number): string {
  if (rank === 1) return "rank-row-top1";
  if (rank === 2) return "rank-row-top2";
  if (rank === 3) return "rank-row-top3";
  return "";
}

export function LeaderboardCard({
  title,
  entries,
  nameKey = "name",
  showGuildAffiliation = false,
}: Props) {
  return (
    <div className="card leaderboard-card">
      <div className="card-header">
        <h3>
          {title}
          {title === "Most Points" && (
            <button
              type="button"
              className="info-tip"
              aria-label={POINTS_INFO}
            >
              ⓘ
              <span className="info-tip-bubble" role="tooltip">
                {POINTS_INFO}
              </span>
            </button>
          )}
        </h3>
      </div>
      <div className="card-body">
        {entries.length === 0 ? (
          <div className="empty-state">No data yet</div>
        ) : (
          <>
            {entries.map((entry) => (
              <div
                className={`rank-row ${rankRowClass(entry.rank)}`}
                key={`${entry.rank}-${entry[nameKey]}`}
              >
                <span className="rank-num">{entry.rank}</span>
                <span className="rank-name">
                  {showGuildAffiliation && nameKey === "name" ? (
                    <>
                      {entry.name}
                      <span className="guild-affiliation">
                        {entry.guild ? ` from ${entry.guild}` : " not in guild"}
                      </span>
                    </>
                  ) : (
                    (entry[nameKey] ?? "—")
                  )}
                </span>
                <span className="rank-value">{formatScore(entry.value)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
