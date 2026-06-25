import { useMemo, useState } from "react";
import {
    buildGuildCommissionHeatmap,
    buildGuildMemberList,
    type GuildHeatmapMode,
} from "../heatmapData";
import type { LeaderboardsData, StageNavTarget, StagesData } from "../types";
import { isCommissionStage } from "../types";
import { formatScore } from "../data";
import { HeatmapGrid } from "./HeatmapGrid";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
    commissionBoards: LeaderboardsData | null;
    guildBoards: LeaderboardsData | null;
    commissionStages: StagesData | null;
    onNavigateToStage: (target: StageNavTarget) => void;
}

export function GuildDataViz({
    commissionBoards,
    guildBoards,
    commissionStages,
    onNavigateToStage,
}: Props) {
    const guildOptions = useMemo(() => {
        const board = guildBoards?.leaderboards.points;
        if (!board) return [];
        return board.entries
            .filter((e) => e.guild)
            .map((e) => ({
                value: e.guild!,
                label: e.guild!,
                searchText: e.guild!,
            }));
    }, [guildBoards]);

    const [guildName, setGuildName] = useState("");
    const [heatmapMode, setHeatmapMode] = useState<GuildHeatmapMode>("points");
    const [showValues, setShowValues] = useState(false);

    const effectiveGuild =
        guildName && guildOptions.some((o) => o.value === guildName)
            ? guildName
            : (guildOptions[0]?.value ?? "");

    const commissionStageList = useMemo(
        () => (commissionStages?.stages ?? []).filter(isCommissionStage),
        [commissionStages],
    );

    const members = buildGuildMemberList(commissionBoards, effectiveGuild);

    const heatmapData = buildGuildCommissionHeatmap(
        commissionStageList,
        effectiveGuild,
        heatmapMode,
    );

    if (guildOptions.length === 0) {
        return <div className="empty-state">Guild data not available yet.</div>;
    }

    return (
        <div className="guild-data-viz">
            <div className="data-viz-controls">
                <SearchableSelect
                    label="Guild"
                    value={effectiveGuild}
                    options={guildOptions}
                    onChange={setGuildName}
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
                <h2 className="section-title">Commissions</h2>
                <HeatmapGrid
                    data={heatmapData}
                    showValues={showValues}
                    onCellClick={onNavigateToStage}
                />
                <div className="viz-mode-toggle">
                    <button
                        type="button"
                        className={`viz-mode-btn ${heatmapMode === "points" ? "active" : ""}`}
                        onClick={() => setHeatmapMode("points")}
                    >
                        Points per stage
                    </button>
                    <button
                        type="button"
                        className={`viz-mode-btn ${heatmapMode === "ranks" ? "active" : ""}`}
                        onClick={() => setHeatmapMode("ranks")}
                    >
                        Rank count per stage
                    </button>
                </div>
            </section>

            <section className="data-viz-section">
                <h2 className="section-title">Guild Members</h2>
                <div className="card guild-member-list">
                    <table className="stage-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => (
                                <tr key={m.name}>
                                    <td>{m.rank}</td>
                                    <td className="player-name">{m.name}</td>
                                    <td className="score">
                                        {formatScore(m.points)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {members.length === 0 && (
                        <div className="empty-state">
                            No members found for this guild.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
