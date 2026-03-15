
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLogoutRedirect } from '@/hooks/auth/useLogoutRedirect';

// Game hooks (each encapsulates a single concern — High Cohesion)
import { useGameTimer } from '@/hooks/game/useGameTimer';
import { useGameBoard } from '@/hooks/game/useGameBoard';
import { useGif } from '@/hooks/game/useGif';
import { useLeaderboard, useLeaderboardListener } from '@/hooks/game/useLeaderboard';

// UI components (pure presentational — Low Coupling)
import GameNav from '@/components/game/GameNav';
import DifficultySelector from '@/components/game/DifficultySelector';
import StatsBar from '@/components/game/StatsBar';
import GameGrid from '@/components/game/GameGrid';
import SidePanel from '@/components/game/SidePanel';
import GameOverPanel from '@/components/game/GameOverPanel';
import LeaderboardView from '@/components/game/LeaderboardView';

// Types
import type { Difficulty } from '@/lib/game/types';

// Concern-based styles (Separation of Concerns)
import '@/styles/base.css';
import '@/styles/nav.css';
import '@/styles/game.css';
import '@/styles/gameover.css';
import '@/styles/leaderboard.css';
import '@/styles/shared.css';

export default function HeartSweeper() {
  const { user } = useAuth();
  useLogoutRedirect();

  // View & difficulty state (page-level coordination)
  const [view, setView] = useState<'game' | 'leaderboard'>('game');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');

  // Timer (single concern)
  const { seconds, formatTime, startTimer, stopTimer, resetTimer } = useGameTimer();

  // Board logic (single concern, low coupling via callbacks)
  const {
    board, heartCount, carrotCount, foundHearts, foundCarrots,
    isGameOver, gameWon, loading, apiError, gridSize, bombCount,
    handleReveal, initGame,
  } = useGameBoard({
    difficulty,
    onTimerStart: startTimer,
    onTimerStop: stopTimer,
    onTimerReset: resetTimer,
    seconds,
  });

  // GIF fetching (reacts to game-over state)
  const { gifUrl } = useGif(isGameOver, gameWon);

  // Score saving (reacts to game-over state)
  useLeaderboard({
    user, difficulty, isGameOver, gameWon,
    foundHearts, foundCarrots, seconds,
  });

  // Real-time leaderboard listener (only active on leaderboard view)
  const { leaderboard, leaderboardLoading } = useLeaderboardListener(
    difficulty,
    view === 'leaderboard'
  );

  const tileSize = gridSize > 12 ? 30 : 42;

  return (
    <div className="heartsweeper-app">

      {loading && (
        <div id="loader">
          <div className="spinner" />
          <p style={{ marginTop: '18px' }}>FETCHING GAME DATA...</p>
        </div>
      )}

      {apiError && (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--danger)' }}>
          <h2>CONNECTION ERROR</h2>
          <p style={{ margin: '20px 0' }}>{apiError}</p>
          <button className="btn" onClick={initGame}>TRY AGAIN</button>
        </div>
      )}

      {!loading && !apiError && (
        <>
          <GameNav view={view} onViewChange={setView} />

          {view === 'game' && (
            <div id="game-view" className="view active">
              <header><h1>HEARTSWEEPER</h1></header>

              <DifficultySelector difficulty={difficulty} onSelect={setDifficulty} />

              <div className="game-container-layout">
                <div className="board-column">
                  <StatsBar
                    heartCount={heartCount}
                    carrotCount={carrotCount}
                    bombCount={bombCount}
                    formattedTime={formatTime()}
                  />

                  <GameGrid
                    board={board}
                    gridSize={gridSize}
                    tileSize={tileSize}
                    onReveal={handleReveal}
                  />

                  {isGameOver && (
                    <GameOverPanel
                      gameWon={gameWon}
                      foundHearts={foundHearts}
                      foundCarrots={foundCarrots}
                      formattedTime={formatTime()}
                      gifUrl={gifUrl}
                      onRestart={initGame}
                    />
                  )}
                </div>

                <SidePanel foundHearts={foundHearts} foundCarrots={foundCarrots} />
              </div>
            </div>
          )}

          {view === 'leaderboard' && (
            <div id="leaderboard-view" className="view active">
              <header><h1>LEADERBOARD</h1></header>

              <DifficultySelector
                difficulty={difficulty}
                onSelect={setDifficulty}
                style={{ marginBottom: '20px' }}
              />

              <LeaderboardView
                leaderboard={leaderboard}
                leaderboardLoading={leaderboardLoading}
                currentUserUid={user?.uid}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
