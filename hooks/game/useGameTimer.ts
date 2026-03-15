// Manages game timer logic (High Cohesion — timer concern only)
"use client";

import { useState, useRef, useCallback } from 'react';

export function useGameTimer() {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start the timer; ignore if already running.
    const startTimer = useCallback(() => {
        if (timerRef.current) return; 
        setSeconds(1);
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }, []);

    // Stop and clear the timer interval.
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Reset the timer back to zero and stop it.
    const resetTimer = useCallback(() => {
        stopTimer();
        setSeconds(0);
    }, [stopTimer]);

    // Format seconds into MM:SS for display.
    const formatTime = useCallback(() => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, [seconds]);

    return { seconds, formatTime, startTimer, stopTimer, resetTimer };
}
