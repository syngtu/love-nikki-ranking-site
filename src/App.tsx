import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  loadGuildLeaderboards,
  loadLeaderboards,
  loadMeta,
  loadStages,
} from "./data";
import { AboutView } from "./components/AboutView";
import { DataVizView } from "./components/DataVizView";
import { LeaderboardsView } from "./components/LeaderboardsView";
import { StageRankingsView } from "./components/StageRankingsView";
import type { LeaderboardsData, MetaData, StageNavTarget, StagesData } from "./types";
import {
  buildAppUrlSearch,
  mergeAppUrlState,
  parseAppUrlState,
  stageNavTargetToAppUrlState,
  toAppSearch,
  type AppUrlState,
} from "./urlState";

function NavTab({
  active,
  href,
  onNavigate,
  children,
  className,
}: {
  active: boolean;
  href: string;
  onNavigate: () => void;
  children: ReactNode;
  className: string;
}) {
  return (
    <a
      href={href}
      className={`${className} ${active ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate();
      }}
    >
      {children}
    </a>
  );
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseAppUrlState(searchParams), [searchParams]);
  const { tab, view, viz } = urlState;

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

  const navigateUrl = useCallback(
    (patch: Partial<AppUrlState>) => {
      setSearchParams(
        new URLSearchParams(buildAppUrlSearch(mergeAppUrlState(urlState, patch))),
      );
    },
    [setSearchParams, urlState],
  );

  const navigateToStage = useCallback(
    (target: StageNavTarget) => {
      setSearchParams(
        new URLSearchParams(buildAppUrlSearch(stageNavTargetToAppUrlState(target))),
      );
    },
    [setSearchParams],
  );

  const tabLink = (patch: Partial<AppUrlState>) =>
    toAppSearch(mergeAppUrlState(urlState, patch));

  return (
    <div className={`app ${tab === "dataviz" ? "app--dataviz" : ""}`}>
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
        <NavTab
          className="tab"
          active={tab === "story"}
          href={tabLink({ tab: "story" })}
          onNavigate={() => navigateUrl({ tab: "story" })}
        >
          Story Stages
        </NavTab>
        <NavTab
          className="tab"
          active={tab === "commission"}
          href={tabLink({ tab: "commission" })}
          onNavigate={() => navigateUrl({ tab: "commission" })}
        >
          Commission Stages
        </NavTab>
        <NavTab
          className="tab"
          active={tab === "dataviz"}
          href={tabLink({ tab: "dataviz" })}
          onNavigate={() => navigateUrl({ tab: "dataviz" })}
        >
          Data Viz
        </NavTab>
        <NavTab
          className="tab"
          active={tab === "about"}
          href={tabLink({ tab: "about" })}
          onNavigate={() => navigateUrl({ tab: "about" })}
        >
          About
        </NavTab>
      </nav>

      {tab === "dataviz" && (
        <nav className="subtabs">
          <NavTab
            className="subtab"
            active={viz === "individual"}
            href={tabLink({ tab: "dataviz", viz: "individual" })}
            onNavigate={() => navigateUrl({ tab: "dataviz", viz: "individual" })}
          >
            Individual
          </NavTab>
          <NavTab
            className="subtab"
            active={viz === "guild"}
            href={tabLink({ tab: "dataviz", viz: "guild" })}
            onNavigate={() => navigateUrl({ tab: "dataviz", viz: "guild" })}
          >
            Guild
          </NavTab>
        </nav>
      )}

      {tab !== "about" && tab !== "dataviz" && (
        <nav className="subtabs">
          <NavTab
            className="subtab"
            active={view === "leaderboards"}
            href={tabLink({ tab, view: "leaderboards" })}
            onNavigate={() => navigateUrl({ tab, view: "leaderboards" })}
          >
            Leaderboards
          </NavTab>
          <NavTab
            className="subtab"
            active={view === "stages"}
            href={tabLink({ tab, view: "stages" })}
            onNavigate={() => navigateUrl({ tab, view: "stages" })}
          >
            Stage Rankings
          </NavTab>
        </nav>
      )}

      <div hidden={tab !== "about"}>
        <AboutView />
      </div>

      <div hidden={tab !== "dataviz"}>
        <DataVizView
          tab={viz}
          storyBoards={storyBoards}
          commissionBoards={commissionBoards}
          guildBoards={guildBoards}
          storyStages={storyStages}
          commissionStages={commissionStages}
          onNavigateToStage={navigateToStage}
        />
      </div>

      <div hidden={tab !== "story" || view !== "leaderboards"}>
        <LeaderboardsView data={storyBoards} />
      </div>

      <div hidden={tab !== "commission" || view !== "leaderboards"}>
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
      </div>

      <div hidden={tab !== "story" || view !== "stages"}>
        <StageRankingsView data={storyStages} />
      </div>

      <div hidden={tab !== "commission" || view !== "stages"}>
        <StageRankingsView data={commissionStages} showGuild />
      </div>
    </div>
  );
}

export default App;
