// client/features/game/components/StatsBar.tsx
// Top stats bar showing goal, bombs, and timer (Presentational component)
"use client";

import { ICONS } from '../constants';

interface StatsBarProps {
    heartCount: number | null;
    carrotCount: number | null;
    bombCount: number;
    formattedTime: string;
}

export default function StatsBar({ heartCount, carrotCount, bombCount, formattedTime }: StatsBarProps) {
    return (
        <div className="stats-bar">
            <div className="stat-card">
                <div className="stat-label">GOAL</div>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <span>{heartCount ?? '?'}</span>
                    <img src={ICONS.heart} alt="Heart" style={{ width: '1.4em', height: '1.4em' }} />
                    <span>{carrotCount ?? '?'}</span>
                    <img src={ICONS.carrot} alt="Carrot" style={{ width: '1.4em', height: '1.4em' }} />
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-label">BOMBS</div>
                <div className="stat-value" style={{display:'flex',alignItems: 'center',justifyContent: 'center',gap: '1px'}}>
                    <img src={ICONS.bomb} alt="Bomb" style={{ width: '1.4em', height: '1.4em', marginRight: '8px' }} />
                    {bombCount}
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-label">TIMER</div>
                <div className="stat-value">{formattedTime}</div>
            </div>
        </div>
    );
}
