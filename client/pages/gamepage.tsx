// app/gamepage/page.tsx
// Thin orchestrator — composes hooks + components (Low Coupling, Separation of Concerns)
"use client";

import { useState } from 'react';
import { useAuth, useLogoutRedirect } from '@/client/features/auth/hooks/authHooks';

// Game hooks (each encapsulates a single concern — High Cohesion)
import { useGameTimer } from '@/client/features/game/hooks/GameTimer';
import { useGameBoard } from '@/client/features/game/hooks/GameBoard';
import { useGif } from '@/client/features/game/hooks/Gif';
import { useLeaderboard, useLeaderboardListener } from '@/client/features/game/hooks/Leaderboard';

// UI components (pure presentational — Low Coupling)
import GameNav from '@/client/features/game/components/GameNav';
import DifficultySelector from '@/client/features/game/components/DifficultySelector';
import StatsBar from '@/client/features/game/components/StatsBar';
import GameGrid from '@/client/features/game/components/GameGrid';
import SidePanel from '@/client/features/game/components/SidePanel';
import GameOverPanel from '@/client/features/game/components/GameOverPanel';
import LeaderboardView from '@/client/features/game/components/LeaderboardView';

// Types
import type { Difficulty } from '@/client/features/game/types';

// Concern-based styles (Separation of Concerns)
import '@/client/features/game/styles/base.css';
import '@/client/features/game/styles/nav.css';
import '@/client/features/game/styles/game.css';
import '@/client/features/game/styles/gameover.css';
import '@/client/features/game/styles/leaderboard.css';
import '@/client/features/game/styles/shared.css';

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