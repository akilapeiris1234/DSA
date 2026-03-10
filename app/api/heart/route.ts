//       app/api/heart/route.ts
// Server-side proxy for the Heart API — eliminates CORS issues
// The browser calls /api/heart, which fetches from marcconrad.com server-side

import { HEART_API_URL } from '@/client/features/game/apiConfig';

export async function GET() {
    try {
        const res = await fetch(
            `${HEART_API_URL}?out=json&t=${Date.now()}`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return Response.json(
                { error: `Upstream API returned ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        console.error('Heart API proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch from Heart API' },
            { status: 502 }
        );
    }
}
