// client/features/game/hooks/useGameBoard.ts
// Manages board generation, tile reveal, win/loss detection (High Cohesion)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { eventBus } from '@/lib/core/events';
import type { Cell, Difficulty } from '../types';
import { CONFIGS, API_BASE_URL, CORS_PROXY_URL } from '../constants';

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
    const [revealedSafeCount, setRevealedSafeCount] = useState(0);
    const [totalSafeTiles, setTotalSafeTiles] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const gridSize = CONFIGS[difficulty].size;
    const bombCount = CONFIGS[difficulty].bombs;

    // Fetch solution from external API
    const fetchSolution = useCallback(async () => {
        setLoading(true);
        setApiError(null);

        try {
            const apiURL = `${API_BASE_URL}?out=json&t=${Date.now()}`;
            const proxyURL = `${CORS_PROXY_URL}?${encodeURIComponent(apiURL)}`;
            const res = await fetch(proxyURL, { cache: 'no-store' });

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
        setTotalSafeTiles(size * size - bombCount);
    }, [heartCount, carrotCount, gridSize, bombCount]);

    // Build board when solution is fetched
    useEffect(() => {
        if (heartCount === null || carrotCount === null) return;
        if (heartCount + carrotCount === 0) return;
        generateBoard();
    }, [heartCount, carrotCount, generateBoard]);

    // Reveal all tiles helper
    const revealAll = useCallback((brd: Cell[][]) => {
        setBoard(brd.map(row => row.map(cell => ({ ...cell, revealed: true }))));
    }, []);

    // Handle tile click
    const handleReveal = useCallback((r: number, c: number) => {
        if (isGameOver || apiError || !board[r]?.[c] || board[r][c].revealed) return;

        // Start timer on first click
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

        if (cell.content === 'heart') setFoundHearts(p => p + 1);
        if (cell.content === 'carrot') setFoundCarrots(p => p + 1);

        setRevealedSafeCount(prev => {
            const next = prev + 1;
            if (next >= totalSafeTiles) {
                setIsGameOver(true);
                setGameWon(true);
                onTimerStop();
                revealAll(newBoard);
            }
            return next;
        });

        setBoard(newBoard);
    }, [isGameOver, apiError, board, totalSafeTiles, onTimerStart, onTimerStop, revealAll]);

    // Emit GAME_OVER event when game ends (Event-Driven Programming)
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
        setRevealedSafeCount(0);
        setBoard([]);
        setApiError(null);
        fetchSolution();
    }, [onTimerReset, fetchSolution]);

    // Reset game when difficulty changes
    useEffect(() => {
        initGame();
    }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

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
