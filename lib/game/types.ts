
//Defines data structures  for the gameplay board

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface Cell {
    content: '' | 'bomb' | 'heart' | 'carrot';
    revealed: boolean;
    neighborBombs: number;
}

export interface GameConfig {
    size: number;
    bombs: number;
}

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    difficulty: Difficulty;
    hearts: number;
    carrots: number;
    time: number;
    result: 'win' | 'loss';
    timestamp: unknown;
}
