import { heatmapTextColor } from "../heatmap";
import type { HeatmapGridData, HeatmapCell } from "../heatmapData";
import type { StageNavTarget } from "../types";

interface Props {
  data: HeatmapGridData;
  showValues: boolean;
  onCellClick?: (target: StageNavTarget) => void;
  twoRowHeaders?: boolean;
}

export function HeatmapGrid({
  data,
  showValues,
  onCellClick,
  twoRowHeaders = false,
}: Props) {
  const { rowLabels, columnHeaders, cells, cornerLabel } = data;
  const colCount = columnHeaders.length;

  const getCell = (rowIndex: number, colIndex: number): HeatmapCell | undefined => {
    return cells[rowIndex * colCount + colIndex];
  };

  const handleCellClick = (cell: HeatmapCell | undefined) => {
    if (!cell || cell.state === "nonexistent" || !cell.navTarget || !onCellClick) return;
    onCellClick(cell.navTarget);
  };

  const chapterPairs = twoRowHeaders
    ? columnHeaders.reduce<string[]>((acc, col, i) => {
        if (i % 2 === 0) acc.push(col.label);
        return acc;
      }, [])
    : [];

  const renderCell = (cell: HeatmapCell | undefined, key: string) => {
    const clickable =
      cell && cell.state !== "nonexistent" && cell.navTarget && onCellClick;
    return (
      <button
        key={key}
        type="button"
        className={`heatmap-cell ${clickable ? "clickable" : ""}`}
        style={{
          backgroundColor: cell?.color ?? "#f3f3f3",
          color: heatmapTextColor(cell?.color ?? "#f3f3f3"),
        }}
        onClick={() => handleCellClick(cell)}
        disabled={!clickable}
        title={
          cell?.state === "ranked" && cell.value !== undefined
            ? String(cell.value)
            : undefined
        }
      >
        {showValues && cell?.value !== undefined ? cell.value : ""}
      </button>
    );
  };

  return (
    <div className="heatmap-scroll">
      <div className="heatmap-wrapper">
        {cornerLabel && <div className="heatmap-volume-title">{cornerLabel}</div>}
        <div className="heatmap-table">
          <div className="heatmap-row heatmap-header-row">
            {twoRowHeaders
              ? chapterPairs.map((ch, i) => (
                  <div key={`ch-${i}`} className="heatmap-header-chapter">
                    <span>{ch}</span>
                  </div>
                ))
              : columnHeaders.map((col, i) => (
                  <div key={`h-${i}`} className="heatmap-header-cell">{col.label}</div>
                ))}
          </div>
          {twoRowHeaders && (
            <div className="heatmap-row heatmap-header-row-sub">
              {columnHeaders.map((col, i) => (
                <div key={`sub-${i}`} className="heatmap-header-sub">{col.subLabel ?? ""}</div>
              ))}
            </div>
          )}
          <div className="heatmap-data-layout">
            <div className="heatmap-row-labels">
              {rowLabels.map((rowLabel, rowIndex) => (
                <div key={`label-${rowIndex}`} className="heatmap-row-label">
                  {rowLabel}
                </div>
              ))}
            </div>
            <div className="heatmap-cell-grid">
              {rowLabels.map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="heatmap-cell-row">
                  {columnHeaders.map((__, colIndex) =>
                    renderCell(getCell(rowIndex, colIndex), `cell-${rowIndex}-${colIndex}`),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
