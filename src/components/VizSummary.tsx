import { formatScore } from "../data";
import type { LeaderboardStats } from "../heatmapData";

interface Props {
  stats: LeaderboardStats;
}

export function VizSummary({ stats }: Props) {
  return (
    <div className="viz-summary">
      <div className="viz-summary-item">
        <span className="viz-summary-label">Top 1</span>
        <span className="viz-summary-value">{stats.top1}</span>
      </div>
      <div className="viz-summary-item">
        <span className="viz-summary-label">Top 5</span>
        <span className="viz-summary-value">{stats.top5}</span>
      </div>
      <div className="viz-summary-item">
        <span className="viz-summary-label">Top 10</span>
        <span className="viz-summary-value">{stats.top10}</span>
      </div>
      <div className="viz-summary-item">
        <span className="viz-summary-label">Top 20</span>
        <span className="viz-summary-value">{stats.top20}</span>
      </div>
      <div className="viz-summary-item">
        <span className="viz-summary-label">Points</span>
        <span className="viz-summary-value">{formatScore(stats.points)}</span>
      </div>
      <div className="viz-summary-item">
        <span className="viz-summary-label">Cumulative Score</span>
        <span className="viz-summary-value">{formatScore(stats.aggregateScore)}</span>
      </div>
    </div>
  );
}
