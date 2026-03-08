// client/features/game/hooks/useGif.ts
// Fetches celebratory/fail GIFs from Giphy on game over (Separation of Concerns)
"use client";

import { useState, useEffect } from 'react';
import { GIPHY_API_KEY } from '../constants';

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
                const url = `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(tags)}&rating=g`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('GIF fetch failed');
                const data = await res.json();
                if (data.data?.images?.original?.url) {
                    setGifUrl(data.data.images.original.url);
                } else {
                    setGifUrl(null);
                }
            } catch (err) {
                console.error('GIF fetch error:', err);
                setGifUrl(null);
            }
        };

        fetchGif();
    }, [isGameOver, gameWon]);

    return { gifUrl };
}
