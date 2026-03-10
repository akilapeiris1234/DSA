// app/api/gif/route.ts
// Server-side proxy for the Giphy API — keeps API key on the server

import { GIPHY_API_KEY, GIPHY_API_URL } from '@/client/features/game/apiConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags') || 'funny';

    try {
        const url = `${GIPHY_API_URL}?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(tags)}&rating=g`;
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            return Response.json(
                { error: `Giphy API returned ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        const gifUrl = data.data?.images?.original?.url || null;
        return Response.json({ gifUrl });
    } catch (error) {
        console.error('Giphy API proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch GIF' },
            { status: 502 }
        );
    }
}
