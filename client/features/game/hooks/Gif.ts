// client/features/game/hooks/Gif.ts
// Fetches celebratory/fail GIFs via Next.js API route on game over (Separation of Concerns)
"use client";

import { useState, useEffect } from 'react';

export function useGif(isGameOver: boolean, gameWon: boolean) {
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isGameOver) {
            setGifUrl(null);
            return;
        }

        const tags = gameWon
            ? 'win celebration victory party congrats success'
            : 'fail game over explosion funny lose oops fail moment';

        const fetchGif = async () => {
            try {
                const res = await fetch(`/api/gif?tags=${encodeURIComponent(tags)}`);
                if (!res.ok) throw new Error('GIF fetch failed');
                const data = await res.json();
                setGifUrl(data.gifUrl || null);
            } catch (err) {
                console.error('GIF fetch error:', err);
                setGifUrl(null);
            }
        };

        fetchGif();
    }, [isGameOver, gameWon]);

    return { gifUrl };
}
