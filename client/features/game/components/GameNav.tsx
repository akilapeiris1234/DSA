// client/features/game/components/GameNav.tsx
// Navigation bar component (Low Coupling — only receives view state via props)
"use client";

import UserStatus from '@/client/components/auth/UserStatus';

interface GameNavProps {
    view: 'game' | 'leaderboard';
    onViewChange: (view: 'game' | 'leaderboard') => void;
}

export default function GameNav({ view, onViewChange }: GameNavProps) {
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <a className={view === 'game' ? 'active' : ''} onClick={() => onViewChange('game')}>
                    Play Game
                </a>
                <a className={view === 'leaderboard' ? 'active' : ''} onClick={() => onViewChange('leaderboard')}>
                    Leaderboard
                </a>
            </div>
            <div style={{ position: 'absolute', right: '20px' }}>
                <UserStatus />
            </div>
        </nav>
    );
}
