export const HEATMAP_COLORS = {
  rank1to5: "#a2c4c9",
  rank6to10: "#b6d7a8",
  rank11to15: "#ffe599",
  rank16to20: "#ea9999",
  unranked: "#f3f3f3",
  nonexistent: "#999999",
} as const;

export function rankColor(rank: number): string {
  if (rank >= 1 && rank <= 5) return HEATMAP_COLORS.rank1to5;
  if (rank >= 6 && rank <= 10) return HEATMAP_COLORS.rank6to10;
  if (rank >= 11 && rank <= 15) return HEATMAP_COLORS.rank11to15;
  if (rank >= 16 && rank <= 20) return HEATMAP_COLORS.rank16to20;
  return HEATMAP_COLORS.unranked;
}

export function guildRankCountColor(count: number): string {
  if (count === 0) return HEATMAP_COLORS.unranked;
  if (count <= 2) return HEATMAP_COLORS.rank16to20;
  if (count <= 4) return HEATMAP_COLORS.rank11to15;
  if (count <= 6) return HEATMAP_COLORS.rank6to10;
  return HEATMAP_COLORS.rank1to5;
}

export function guildPointsColor(points: number): string {
  if (points === 0) return HEATMAP_COLORS.unranked;
  if (points <= 25) return HEATMAP_COLORS.rank16to20;
  if (points <= 50) return HEATMAP_COLORS.rank11to15;
  if (points <= 75) return HEATMAP_COLORS.rank6to10;
  return HEATMAP_COLORS.rank1to5;
}

export function heatmapTextColor(bg: string): string {
  if (bg === HEATMAP_COLORS.rank11to15 ) {
    return "#3d2c3e";
  }
  if (bg === HEATMAP_COLORS.unranked) {
    return "#f3f3f3"
  }
  return "#ffffff";
}
