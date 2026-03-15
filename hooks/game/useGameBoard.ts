//low coupling
"use client";

import { useState, useEffect, useCallback } from 'react';
import { eventBus } from '@/lib/core/events';
import type { Cell, Difficulty } from '@/lib/game/types';
import { CONFIGS } from '@/lib/game/constants';

interface UseGameBoardProps {
    difficulty: Difficulty;
    onTimerStart: () => void;
    onTimerStop: () => void;
    onTimerReset: () => void;
    seconds: number;
}

export function useGameBoard({ difficulty, onTimerStart, onTimerStop, onTimerReset, seconds }: UseGameBoardProps) {
    const [board, setBoard] = useState<Cell[][]>([]);
    const [heartCount, setHeartCount] = useState<number | null>(null);
    const [carrotCount, setCarrotCount] = useState<number | null>(null);
    const [foundHearts, setFoundHearts] = useState(0);
    const [foundCarrots, setFoundCarrots] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const gridSize = CONFIGS[difficulty].size;
    const bombCount = CONFIGS[difficulty].bombs;

    const fetchSolution = useCallback(async () => {
        setLoading(true);
        setApiError(null);

        try {
            const res = await fetch(`/api/heart?t=${Date.now()}`, { cache: 'no-store' });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const hearts = Number(data.solution ?? 0);
            const carrots = Number(data.carrots ?? 0);

            if (isNaN(hearts) || isNaN(carrots)) throw new Error("Invalid API data");

            setHeartCount(hearts);
            setCarrotCount(carrots);
        } catch (err: unknown) {
            console.error(err);
            setApiError("Cannot connect to the game server. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);
    // Fetch solution numbers (hearts, carrots) from the game API.

    // Generate game board
    const generateBoard = useCallback(() => {
        if (heartCount === null || carrotCount === null) return;

        const size = gridSize;
        const newBoard: Cell[][] = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null).map(() => ({ content: '' as const, revealed: false, neighborBombs: 0 })));

        const positions = Array.from({ length: size * size }, (_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        let idx = 0;

        for (let i = 0; i < bombCount && idx < positions.length; i++, idx++) {
            const pos = positions[idx];
            const r = Math.floor(pos / size);
            const c = pos % size;
            newBoard[r][c].content = 'bomb';
        }

        for (let i = 0; i < (heartCount || 0) && idx < positions.length; i++, idx++) {
            const pos = positions[idx];
            const r = Math.floor(pos / size);
            const c = pos % size;
            newBoard[r][c].content = 'heart';
        }

        for (let i = 0; i < (carrotCount || 0) && idx < positions.length; i++, idx++) {
            const pos = positions[idx];
            const r = Math.floor(pos / size);
            const c = pos % size;
            newBoard[r][c].content = 'carrot';
        }

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newBoard[r][c].content === 'bomb') continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < size && nc >= 0 && nc < size && newBoard[nr][nc].content === 'bomb') {
                            count++;
                        }
                    }
                }
                newBoard[r][c].neighborBombs = count;
            }
        }

        setBoard(newBoard);
    }, [heartCount, carrotCount, gridSize, bombCount]);

    // All board generation logic stays here.
    // Build board when solution is fetched
    useEffect(() => {
        if (heartCount === null || carrotCount === null) return;
        if (heartCount + carrotCount === 0) return;
        generateBoard();
    }, [heartCount, carrotCount, generateBoard]);

    // Reveal all tiles 
    const revealAll = useCallback((brd: Cell[][]) => {
        setBoard(brd.map(row => row.map(cell => ({ ...cell, revealed: true }))));
    }, []);

    // Handle tile click
    const handleReveal = useCallback((r: number, c: number) => {
        if (isGameOver || apiError || !board[r]?.[c] || board[r][c].revealed) return;


        onTimerStart();

        const newBoard = board.map(row => row.slice());
        newBoard[r][c].revealed = true;
        const cell = newBoard[r][c];

        if (cell.content === 'bomb') {
            setIsGameOver(true);
            onTimerStop();
            revealAll(newBoard);
            return;
        }

        let currentHearts = foundHearts;
        let currentCarrots = foundCarrots;

        if (cell.content === 'heart') {
            currentHearts++;
            setFoundHearts(currentHearts);
        }
        if (cell.content === 'carrot') {
            currentCarrots++;
            setFoundCarrots(currentCarrots);
        }

        if (heartCount !== null && carrotCount !== null && currentHearts === heartCount && currentCarrots === carrotCount) {
            setIsGameOver(true);
            setGameWon(true);
            onTimerStop();
        }

        setBoard(newBoard);
    }, [isGameOver, apiError, board, onTimerStart, onTimerStop, revealAll, foundHearts, foundCarrots, heartCount, carrotCount]);
    // Handle a user clicking a tile. Starts timer, updates found counts, checks for win/loss, and reveals tiles as needed.
    useEffect(() => {
        if (isGameOver) {
            eventBus.emit({
                type: 'GAME_OVER',
                payload: { won: gameWon, hearts: foundHearts, carrots: foundCarrots, time: seconds },
            });
        }
    }, [isGameOver, gameWon, foundHearts, foundCarrots, seconds]);

    // Initialize game
    const initGame = useCallback(() => {
        onTimerReset();
        setIsGameOver(false);
        setGameWon(false);
        setFoundHearts(0);
        setFoundCarrots(0);
        setBoard([]);
        setApiError(null);
        fetchSolution();
    }, [onTimerReset, fetchSolution]);



    useEffect(() => {
        initGame();
    }, [difficulty, initGame]);

    return {
        board,
        heartCount,
        carrotCount,
        foundHearts,
        foundCarrots,
        isGameOver,
        gameWon,
        loading,
        apiError,
        gridSize,
        bombCount,
        handleReveal,
        initGame,
    };
}
