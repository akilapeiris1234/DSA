// client/features/game/hooks/useLeaderboard.ts
// Firebase leaderboard: save scores + real-time listener (Separation of Concerns)
"use client";

import { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    limit,
    onSnapshot,
    serverTimestamp,
    getDocs,
    updateDoc,
    doc,
} from 'firebase/firestore';
import { eventBus } from '@/lib/core/events';
import type { Difficulty, LeaderboardEntry } from '../types';

interface UseLeaderboardProps {
    user: { uid: string; displayName?: string | null; email?: string | null } | null;
    difficulty: Difficulty;
    isGameOver: boolean;
    gameWon: boolean;
    foundHearts: number;
    foundCarrots: number;
    seconds: number;
}

export function useLeaderboard({
    user,
    difficulty,
    isGameOver,
    gameWon,
    foundHearts,
    foundCarrots,
    seconds,
}: UseLeaderboardProps) {
    const [scoreSaved, setScoreSaved] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    // Save score on game over (with duplicate prevention — update only if better)
    useEffect(() => {
        const saveScore = async () => {
            if (isGameOver && !scoreSaved) {
                if (foundHearts === 0 && foundCarrots === 0) return;
                setScoreSaved(true);
                try {
                    const db = getFirestore(getApp());
                    const uid = user?.uid || 'guest';
                    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest Player';
                    const newTotal = foundHearts + foundCarrots;

                    // Check for existing record (Low Coupling with Firestore)
                    const existingQuery = query(
                        collection(db, 'leaderboard'),
                        where('uid', '==', uid),
                        where('difficulty', '==', difficulty)
                    );
                    const existingDocs = await getDocs(existingQuery);

                    if (!existingDocs.empty) {
                        const existingDoc = existingDocs.docs[0];
                        const existingData = existingDoc.data();
                        const existingTotal = (existingData.hearts || 0) + (existingData.carrots || 0);

                        const isBetter =
                            newTotal > existingTotal ||
                            (newTotal === existingTotal && seconds < (existingData.time || Infinity));

                        if (isBetter) {
                            await updateDoc(doc(db, 'leaderboard', existingDoc.id), {
                                displayName,
                                hearts: foundHearts,
                                carrots: foundCarrots,
                                time: seconds,
                                result: gameWon ? 'win' : 'loss',
                                timestamp: serverTimestamp(),
                            });
                        }
                    } else {
                        await addDoc(collection(db, 'leaderboard'), {
                            uid,
                            displayName,
                            difficulty,
                            hearts: foundHearts,
                            carrots: foundCarrots,
                            time: seconds,
                            result: gameWon ? 'win' : 'loss',
                            timestamp: serverTimestamp(),
                        });
                    }

                    // Event-Driven: notify other parts of the app
                    eventBus.emit({ type: 'SCORE_SAVED', payload: { uid, difficulty } });
                } catch (error) {
                    console.error("Error saving score:", error);
                    setScoreSaved(false);
                }
            }
        };
        saveScore();
    }, [isGameOver, scoreSaved, user, difficulty, foundHearts, foundCarrots, seconds, gameWon]);

    // Reset scoreSaved when starting a new game
    useEffect(() => {
        if (!isGameOver) {
            setScoreSaved(false);
        }
    }, [isGameOver]);

    return { scoreSaved, leaderboard, leaderboardLoading, setLeaderboardLoading, setLeaderboard };
}

// Separate hook for leaderboard listening (can be used independently — Interoperability)
export function useLeaderboardListener(difficulty: Difficulty, isActive: boolean) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    useEffect(() => {
        if (!isActive) return;
        setLeaderboardLoading(true);
        const db = getFirestore(getApp());
        const q = query(
            collection(db, 'leaderboard'),
            where('difficulty', '==', difficulty),
            limit(50)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs
                .map(d => d.data() as LeaderboardEntry)
                .filter(entry => entry.hearts > 0 || entry.carrots > 0)
                .sort((a, b) => {
                    const totalA = a.hearts + a.carrots;
                    const totalB = b.hearts + b.carrots;
                    if (totalB !== totalA) return totalB - totalA;
                    return a.time - b.time;
                })
                .slice(0, 20);
            setLeaderboard(entries);
            setLeaderboardLoading(false);
        }, (error) => {
            console.error("Error fetching leaderboard:", error);
            setLeaderboardLoading(false);
        });
        return () => unsubscribe();
    }, [isActive, difficulty]);

    return { leaderboard, leaderboardLoading };
}
