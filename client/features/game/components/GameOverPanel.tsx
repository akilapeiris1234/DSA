// client/features/game/components/GameOverPanel.tsx
// Game over results panel (Presentational — shows win/loss, GIF, stats)
"use client";

import Image from 'next/image';
import { ICONS } from '../constants';

interface GameOverPanelProps {
    gameWon: boolean;
    foundHearts: number;
    foundCarrots: number;
    formattedTime: string;
    gifUrl: string | null;
    onRestart: () => void;
}

export default function GameOverPanel({
    gameWon,
    foundHearts,
    foundCarrots,
    formattedTime,
    gifUrl,
    onRestart,
}: GameOverPanelProps) {
    return (
        <div id="game-over"
            className={gameWon ? 'win' : 'lose'}
            style={{
                display: 'block',
                padding: '24px',
                margin: '24px auto',
                maxWidth: '480px',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                background: gameWon
                    ? 'linear-gradient(145deg, #0f3a2a, #1a2f22)'
                    : 'linear-gradient(145deg, #3a1a1f, #2a1a22)',
                textAlign: 'center',
            }}>
            <h2 id="res-title" style={{ marginBottom: '16px', fontSize: '2.2rem' }}>
                {gameWon ? 'MISSION ACCOMPLISHED!' : 'GAME OVER'}
            </h2>

            <p id="res-msg" style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                {gameWon
                    ? 'You cleared the sector like a pro!'
                    : 'You found the mine, Are you bind????'}
            </p>

            {gifUrl ? (
                <div style={{
                    margin: '0 auto 24px auto',
                    maxWidth: '320px',
                    textAlign: 'center'
                }}>
                    <Image src={gifUrl} alt={gameWon ? "Victory celebration" : "Epic fail moment"} className="game-over-gif" width={320} height={240} unoptimized />
                </div>
            ) : (
                <div style={{ margin: '24px auto', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                    {gameWon ? 'Epic win moment loading...' : 'Oof... tough one!'}
                </div>
            )}

            <div className="result-stats" style={{ margin: '24px 0' }}>
                <div className="res-stat-item">
                    <Image src={ICONS.heart} alt="Heart" width={24} height={24} style={{ width: '1.5em', marginRight: '8px' }} />
                    Heart <b>{foundHearts}</b>
                </div>
                <div className="res-stat-item">
                    <Image src={ICONS.carrot} alt="Carrot" width={24} height={24} style={{ width: '1.5em', marginRight: '8px' }} />
                    Carrot <b>{foundCarrots}</b>
                </div>
                <div className="res-stat-item">
                    ⏱️ <b>{formattedTime}</b>
                </div>
            </div>

            <button className="btn" onClick={onRestart} style={{ padding: '14px 36px' }}>
                START NEW GAME
            </button>
        </div>
    );
}
