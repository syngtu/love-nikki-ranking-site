import { useEffect, useState } from "react";
import {
  loadGuildLeaderboards,
  loadLeaderboards,
  loadMeta,
  loadStages,
} from "./data";
import { LeaderboardsView } from "./components/LeaderboardsView";
import { StageRankingsView } from "./components/StageRankingsView";
import type { LeaderboardsData, MetaData, Mode, StagesData, View } from "./types";

function App() {
  const [mode, setMode] = useState<Mode>("story");
  const [view, setView] = useState<View>("leaderboards");
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [storyBoards, setStoryBoards] = useState<LeaderboardsData | null>(null);
  const [commissionBoards, setCommissionBoards] = useState<LeaderboardsData | null>(null);
  const [guildBoards, setGuildBoards] = useState<LeaderboardsData | null>(null);
  const [storyStages, setStoryStages] = useState<StagesData | null>(null);
  const [commissionStages, setCommissionStages] = useState<StagesData | null>(null);

  useEffect(() => {
    loadMeta().then(setMeta);
    loadLeaderboards("story").then(setStoryBoards);
    loadLeaderboards("commission").then(setCommissionBoards);
    loadGuildLeaderboards().then(setGuildBoards);
    loadStages("story").then(setStoryStages);
    loadStages("commission").then(setCommissionStages);
  }, []);

  const playerBoards = mode === "story" ? storyBoards : commissionBoards;
  const stageData = mode === "story" ? storyStages : commissionStages;

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">1</span>
          <h1>Love Nikki Rankings</h1>
        </div>
        <p>
          Story &amp; Commission stage leaderboards
          {meta?.last_updated && (
            <> · Last updated {meta.last_updated}</>
          )}
        </p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${mode === "story" ? "active" : ""}`}
          onClick={() => setMode("story")}
        >
          Story Stages
        </button>
        <button
          className={`tab ${mode === "commission" ? "active" : ""}`}
          onClick={() => setMode("commission")}
        >
          Commission Stages
        </button>
      </nav>

      <nav className="subtabs">
        <button
          className={`subtab ${view === "leaderboards" ? "active" : ""}`}
          onClick={() => setView("leaderboards")}
        >
          Leaderboards
        </button>
        <button
          className={`subtab ${view === "stages" ? "active" : ""}`}
          onClick={() => setView("stages")}
        >
          Stage Rankings
        </button>
      </nav>

      {view === "leaderboards" ? (
        mode === "commission" ? (
          <div className="leaderboard-sections">
            <section className="leaderboard-section">
              <h2 className="section-title">Individual Rankings</h2>
              <LeaderboardsView data={commissionBoards} showGuildAffiliation />
            </section>
            <section className="leaderboard-section">
              <h2 className="section-title">Guild Rankings</h2>
              <LeaderboardsView data={guildBoards} nameKey="guild" />
            </section>
          </div>
        ) : (
          <LeaderboardsView data={playerBoards} />
        )
      ) : (
        <StageRankingsView
          data={stageData}
          showGuild={mode === "commission"}
        />
      )}
    </div>
  );
}

export default App;
