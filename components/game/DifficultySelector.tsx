
// Difficulty selector buttons 
"use client";

import type { Difficulty } from '@/lib/game/types';

interface DifficultySelectorProps {
    difficulty: Difficulty;
    onSelect: (difficulty: Difficulty) => void;
    style?: React.CSSProperties;
}

const LEVELS: Difficulty[] = ['beginner', 'intermediate', 'expert'];

export default function DifficultySelector({ difficulty, onSelect, style }: DifficultySelectorProps) {
    return (
        <div className="difficulty-selector" style={style}>
            {LEVELS.map(lvl => (
                <button key={lvl} className={`diff-btn ${difficulty === lvl ? 'active' : ''}`} onClick={() => onSelect(lvl)} >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
            ))}
        </div>
    );
}
