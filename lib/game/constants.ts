// Defines the grid size and bomb count for each difficulty level (Separation of Concerns)

import type { Difficulty, GameConfig } from './types';

export const CONFIGS: Record<Difficulty, GameConfig> = {
    beginner: { size: 8, bombs:10 },
    intermediate: { size: 12, bombs: 25 },
    expert: { size: 16, bombs: 45 },
};

export const ICONS = {
    heart: '/icons/heart.png',
    carrot: '/icons/carrot.png',
    bomb: '/icons/blast.png',
} as const;


