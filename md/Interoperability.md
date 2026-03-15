# Interoperability — Simple Guide and Examples

## What "Interoperability" Means

Interoperability means your app can work smoothly with **other systems** (external APIs, services) by using server proxies as intermediaries.

**Simple analogy:** Instead of your browser talking directly to external services, your server acts as a middleman — it receives requests from the browser, talks to external services, and sends back clean responses.

## Why It's Useful

- **Connect to external services:** Your app can use Giphy (GIFs), marcconrad.com (game data), and other APIs.
- **Solve CORS problems:** Browsers cannot talk directly to external APIs (CORS errors). Your server can.
- **Secure:** Keep API keys on the server, never expose them to the browser.
- **Clean data:** Extract only what you need from messy API responses.
- **Easy to change:** Update external services in one place without changing browser code.

---

# Example 1: External Interoperability — Game Data API (Heart Puzzle)

The game needs puzzle data (how many hearts and carrots to find). This data comes from an external API (`marcconrad.com`). We use a **server proxy** to fetch it.

## How It Works

```
Browser (Client)
    ↓ (fetch /api/heart)
Local Proxy (/api/heart)
    ↓ (fetch from server — no CORS issue)
External API (marcconrad.com)
    ↓ (returns JSON with solution & carrots)
Local Proxy extracts data
    ↓
Browser gets response
```

## The Code

### Step 1: Server Proxy — `app/api/heart/route.ts`

```ts
// Server-side proxy for the Heart API
// The browser calls /api/heart, which fetches from marcconrad.com server-side
// This solves CORS (Cross-Origin Resource Sharing) problems — browsers cannot talk to external APIs directly

import { HEART_API_URL } from '@/lib/game/apiConfig';

export async function GET() {
    try {
        // Call the external API from the server (allowed, no CORS issues)
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

        // Parse the response as JSON
        const data = await res.json();
        // Return clean JSON to the browser
        return Response.json(data);
    } catch (error) {
        console.error('Heart API proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch from Heart API' },
            { status: 502 }
        );
    }
}
```

**Explanation:** The server fetches from the external API (no CORS issues), parses the response, and returns clean JSON to the browser.

### Step 2: Game Hook Uses the Proxy — `hooks/game/useGameBoard.ts`

```ts
export function useGameBoard({ difficulty, onTimerStart, onTimerStop, onTimerReset, seconds }) {
    const [heartCount, setHeartCount] = useState<number | null>(null);
    const [carrotCount, setCarrotCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch puzzle solution from the proxy
    const fetchSolution = useCallback(async () => {
        setLoading(true);
        setApiError(null);

        try {
            // Call the local proxy (not the external API directly)
            const res = await fetch(`/api/heart?t=${Date.now()}`, { cache: 'no-store' });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // Parse the response
            const data = await res.json();
            const hearts = Number(data.solution ?? 0);
            const carrots = Number(data.carrots ?? 0);

            if (isNaN(hearts) || isNaN(carrots)) throw new Error("Invalid API data");

            // Set counts for this game
            setHeartCount(hearts);
            setCarrotCount(carrots);
        } catch (err: unknown) {
            console.error(err);
            setApiError("Cannot connect to the game server. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { heartCount, carrotCount, loading, apiError, fetchSolution, /* ... */ };
}
```

**Explanation:** Calls the local proxy `/api/heart`, gets hearts and carrots counts, and handles errors gracefully.

### Step 3: Component Uses the Hook — `app/game/page.tsx`

```tsx
export default function HeartSweeper() {
  const {
    board, heartCount, carrotCount, foundHearts, foundCarrots,
    isGameOver, gameWon, loading, apiError, gridSize, bombCount,
    handleReveal, initGame,
  } = useGameBoard({
    difficulty,
    onTimerStart: startTimer,
    onTimerStop: stopTimer,
    onTimerReset: resetTimer,
    seconds,
  });

  return (
    <div className="heartsweeper-app">
      {loading && (
        <div id="loader">
          <div className="spinner" />
          <p>FETCHING GAME DATA...</p>
        </div>
      )}
      
      {apiError && (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>CONNECTION ERROR</h2>
          <p>{apiError}</p>
          <button onClick={initGame}>TRY AGAIN</button>
        </div>
      )}
      
      {!loading && !apiError && (
        <GameGrid board={board} gridSize={gridSize} onReveal={handleReveal} />
      )}
    </div>
  );
}
```

**Explanation:** Shows a loading spinner while fetching, an error message if the API fails, and the game grid once data arrives.

**Benefits:**
- ✓ Easy to swap APIs: Change `HEART_API_URL` in one file.
- ✓ Secure: API details hidden from the browser.
- ✓ Handles errors: Users see a friendly message if the API is down.
- ✓ Reusable: Any hook can call `/api/heart`.

---

# Example 2: External Interoperability — Giphy API (Celebration GIFs)

When the game ends, show a celebratory or funny GIF. The data comes from Giphy API via a server proxy that **hides the API key**.

## How It Works

```
Game ends (win or loss)
    ↓
useGif hook detects game state
    ↓
Hook calls /api/gif?tags=win (or loss tags)
    ↓
Server proxy fetches from Giphy with API key (secure on server)
    ↓
Giphy returns GIF data
    ↓
Proxy extracts GIF URL and returns clean JSON
    ↓
Hook sets GIF state
    ↓
UI displays GIF
```

## The Code

### Step 1: Server Proxy — `app/api/gif/route.ts`

```ts
// Server-side proxy for the Giphy API
// Keeps API key on the server, not exposed in browser code

import { GIPHY_API_KEY, GIPHY_API_URL } from '@/lib/game/apiConfig';

export async function GET(request: Request) {
    // Get search tags from the URL query string
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags') || 'funny';

    try {
        // Call Giphy API from the server (API key is safe here, hidden from browser)
        const url = `${GIPHY_API_URL}?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(tags)}&rating=g`;
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            return Response.json(
                { error: `Giphy API returned ${res.status}` },
                { status: res.status }
            );
        }

        // Parse the response
        const data = await res.json();
        // Extract just the GIF URL (clean up the response)
        const gifUrl = data.data?.images?.original?.url || null;
        // Return clean JSON to the browser
        return Response.json({ gifUrl });
    } catch (error) {
        console.error('Giphy API proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch GIF' },
            { status: 502 }
        );
    }
}
```

**Explanation:** Takes tags from the browser, calls Giphy API with the secret API key (server-side only), extracts just the GIF URL, and returns clean JSON.

### Step 2: Game Hook Uses the Proxy — `hooks/game/useGif.ts`

```ts
// Fetches celebratory/fail GIFs when the game ends
"use client";

import { useState, useEffect } from 'react';

export function useGif(isGameOver: boolean, gameWon: boolean) {
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isGameOver) {
            setGifUrl(null);
            return;
        }

        // Choose search tags based on win or loss
        const tags = gameWon
            ? 'win celebration victory party congrats success'
            : 'fail game over explosion funny lose oops fail moment';

        const fetchGif = async () => {
            try {
                // Call the local proxy (not Giphy directly)
                const res = await fetch(`/api/gif?tags=${encodeURIComponent(tags)}`);
                if (!res.ok) throw new Error('GIF fetch failed');
                const data = await res.json();
                setGifUrl(data.gifUrl || null);
            } catch (err) {
                console.error('GIF fetch error:', err);
                // If GIF fetch fails, game still works (just no GIF shown)
                setGifUrl(null);
            }
        };

        fetchGif();
    }, [isGameOver, gameWon]);

    return { gifUrl };
}
```

**Explanation:** Listens for when the game ends, picks win or loss tags, calls the proxy, and sets the GIF URL in state.

### Step 3: Component Uses the Hook — `app/game/page.tsx`

```tsx
export default function HeartSweeper() {
  const { isGameOver, gameWon, /* ... */ } = useGameBoard({ /* ... */ });
  
  // Fetch GIF when game ends
  const { gifUrl } = useGif(isGameOver, gameWon);

  return (
    <div>
      {isGameOver && (
        <GameOverPanel
          gameWon={gameWon}
          gifUrl={gifUrl}  {/* Pass GIF URL to component */}
          onRestart={initGame}
        />
      )}
    </div>
  );
}
```

**Explanation:** Calls the hook with game state, gets the GIF URL, and passes it to the GameOverPanel component.

**Benefits:**
- ✓ Secure: API key never sent to browser.
- ✓ Easy to change: Swap Giphy for another service in one file.
- ✓ Flexible: Browser requests different GIFs (win vs loss).
- ✓ Graceful fallback: If Giphy is down, game still works.

---

## Comparison Table

| Aspect | Heart API | Giphy API |
|---|---|---|
| **External Service** | marcconrad.com (puzzle data) | Giphy (celebration GIFs) |
| **Server Proxy** | `app/api/heart/route.ts` | `app/api/gif/route.ts` |
| **Client Hook** | `useGameBoard.ts` | `useGif.ts` |
| **Purpose** | Get puzzle counts (hearts, carrots) | Get visual feedback (GIFs) |
| **Security** | No secret data | API key hidden on server |
| **Reusable** | Yes — any hook can call `/api/heart` | Yes — any component can call `/api/gif` |

---

## Architectural Pattern

```
┌── Browser (Client-Side) ───────────────────────┐
│ useGameBoard         useGif                      │
│      ↓                  ↓                        │
│  /api/heart  ────  /api/gif                     │
└───────────────────────────────────────────────┘
         ↓                  ↓
┌── Next.js Server (Server-Side) ────────────────┐
│ Proxy logic                                      │
│      ↓                  ↓                        │
│  marcconrad.com ── Giphy API                    │
└───────────────────────────────────────────────┘
```

**Key Points:**
- **Browser talks to local proxies** (`/api/heart`, `/api/gif`) — fast, same origin, no CORS issues.
- **Server talks to external APIs** — has API keys, no CORS restrictions.
- **Easy maintenance:** Swap or update external services without touching browser code.
- **Secure:** API keys stay on the server, never exposed to the browser.

---

## Checklist for New Code

When building interoperability:

- ✓ Are you calling an external API? → Use a server proxy.
- ✓ Is the API key sensitive? → Keep it on the server, never in browser code.
- ✓ Does a hook/component need external data? → Call the local proxy.
- ✓ Can you extract useful data? → Return clean, simple JSON.
- ✓ Can multiple features reuse this proxy? → Put it in a shared API route.

### Step 5: The Result
1.  Our server extracts just the URL (e.g., `.../giphy.gif`).
2.  It sends that simple text string back to the browser.
3.  `GameOverPanel.tsx` puts that URL into an `<img src="..." />` tag.
4.  **User sees:** A funny moving picture!
