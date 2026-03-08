// client/features/game/hooks/useGameTimer.ts
// Manages game timer logic (High Cohesion — timer concern only)
"use client";

import { useState, useRef, useCallback } from 'react';

export function useGameTimer() {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) return; // Already running
        setSeconds(1);
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resetTimer = useCallback(() => {
        stopTimer();
        setSeconds(0);
    }, [stopTimer]);

    const formatTime = useCallback(() => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, [seconds]);

    return { seconds, formatTime, startTimer, stopTimer, resetTimer };
}
