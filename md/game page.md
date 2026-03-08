# Design Concepts Explained — HeartSweeper Game Page

This document explains the 7 design concepts used in the game page code, with real examples from your project. Written in simple English so you can understand each concept clearly.

---

## 1. Low Coupling

**What it means:** Each part of the code works on its own. It does NOT depend on other parts to do its job. Parts talk to each other through **props** (like passing a message), not by reaching into each other's code.

**Simple analogy:** Think of a TV remote. The remote does not need to know how the TV works inside. It just sends a signal (a prop). The TV receives the signal and does its thing. They are "loosely connected" — that is low coupling.

**Where we use it in our code:**

### Example 1 — GameGrid component
```tsx
// GameGrid.tsx — This component ONLY knows how to draw tiles
// It does NOT know about Firebase, timers, or how the board is generated

export default function GameGrid({ board, gridSize, tileSize, onReveal }: GameGridProps) {
  // It just receives the board data and a click handler
  // It does not care WHERE the board came from
}
```

### Example 2 — useGameBoard hook
```tsx
// useGameBoard receives timer functions as callbacks
// It does NOT import or own the timer — it just calls the functions it was given

export function useGameBoard({ onTimerStart, onTimerStop, onTimerReset }) {
  // When a tile is clicked, it calls onTimerStart()
  // It does not know HOW the timer works inside
}
```

**Why this is good:** If you want to change how the timer works, you ONLY change `useGameTimer.ts`. Nothing else breaks because nothing else knows how the timer works inside.

---

## 2. High Cohesion

**What it means:** Each file does **one job**, and everything related to that job is in that **one** file. Nothing is spread across multiple places.

**Simple analogy:** A kitchen drawer should have ALL the spoons together, not one spoon in the bedroom and another in the bathroom. Everything related to the same job lives together.

**Where we use it in our code:**

| File | One job only |
|---|---|
| `useGameTimer.ts` | Timer: start, stop, reset, format time — **nothing else** |
| `useGameBoard.ts` | Board: generate tiles, handle clicks, detect win/loss — **nothing else** |
| `useGif.ts` | GIF: fetch a funny GIF when game ends — **nothing else** |
| `useLeaderboard.ts` | Scores: save to Firebase, load leaderboard — **nothing else** |

**Why this is good:** If there is a bug with the timer, you know EXACTLY which file to open — `useGameTimer.ts`. You don't have to search through a 650-line file.

---

## 3. Separation of Concerns

**What it means:** Different types of things go into different files. Configuration stays separate from logic. Logic stays separate from UI. UI stays separate from styles.

**Simple analogy:** In a hospital, doctors do medical work, receptionists handle paperwork, and cleaners handle cleaning. They don't mix jobs. Each person has one concern.

**Where we use it in our code:**

```
types.ts       → What shape the data looks like (types only)
constants.ts   → All settings and config values (no logic)
hooks/         → All game logic and behavior (no UI)
components/    → All visual UI (no logic, no Firebase)
styles/        → All CSS (split by what part of the page it styles)
page.tsx       → Just connects everything together (no logic inside)
```

### Real example — API URL
```typescript
// constants.ts — Config value lives here
export const API_BASE_URL = 'http://marcconrad.com/uob/heart/api.php';

// useGameBoard.ts — Logic uses it, but does not define it
import { API_BASE_URL } from '../constants';
const apiURL = `${API_BASE_URL}?out=json&t=${Date.now()}`;
```

**Why this is good:** If you need to change the API URL, you go to ONE place (`constants.ts`). You don't search through hooks or components.

---

## 4. Event-Driven Programming

**What it means:** Parts of the code talk to each other by sending **events** (like announcements). One part says "something happened!" and other parts can listen and react. They don't call each other directly.

**Simple analogy:** A school bell rings (event). ALL students hear it and react (go to the next class). The bell does not need to know the name of every student. It just rings.

**Where we use it in our code:**

### Sending an event (announcing something happened)
```typescript
// useGameBoard.ts — When the game ends, it announces it
eventBus.emit({
  type: 'GAME_OVER',
  payload: { won: gameWon, hearts: foundHearts, carrots: foundCarrots, time: seconds },
});
```

### Sending another event
```typescript
// useLeaderboard.ts — When a score is saved, it announces it
eventBus.emit({
  type: 'SCORE_SAVED',
  payload: { uid, difficulty }
});
```

### Event types are defined in one place
```typescript
// lib/core/events.ts
export type GameEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_OVER'; payload: { won: boolean; hearts: number; ... } }
  | { type: 'SCORE_SAVED'; payload: { uid: string; difficulty: string } };
```

**Why this is good:** `useGameBoard` does not need to know about `useLeaderboard`. It just says "game is over!" and anyone who cares can listen. This keeps things loosely connected (low coupling).

---

## 5. Interoperability

**What it means:** The hooks and components can be **reused** in different places. They are not locked to one specific page or feature.

**Simple analogy:** A USB cable works with any USB port — phone, laptop, speaker. It is not made for just one device.

**Where we use it in our code:**

### Example 1 — DifficultySelector is reused
```tsx
// Used in the GAME view
<DifficultySelector difficulty={difficulty} onSelect={setDifficulty} />

// Also used in the LEADERBOARD view (same component, different place)
<DifficultySelector difficulty={difficulty} onSelect={setDifficulty} style={{ marginBottom: '20px' }} />
```

### Example 2 — useLeaderboardListener is independent
```typescript
// useLeaderboardListener is a SEPARATE hook from useLeaderboard
// It can be used on ANY page that needs leaderboard data
// It does NOT need the score-saving logic

const { leaderboard, leaderboardLoading } = useLeaderboardListener(difficulty, true);
```

### Example 3 — Types are shared
```typescript
// types.ts can be imported by ANY feature, not just the game page
import type { Difficulty, LeaderboardEntry } from '@/client/features/game/types';
```

**Why this is good:** If you build a new page (like an admin dashboard), you can reuse `useLeaderboardListener`, `DifficultySelector`, or `LeaderboardView` without rewriting anything.

---

## 6. Virtual Identity

**What it means:** Each player has **one identity** (one record) per difficulty level on the leaderboard. The system prevents duplicate entries for the same player.

**Simple analogy:** In a school exam, each student gets ONE result per subject. If they retake the exam and score higher, their old score is updated. They don't get two entries.

**Where we use it in our code:**

```typescript
// useLeaderboard.ts — Before saving, check if this player already has a record

// Step 1: Search for existing record with same uid + difficulty
const existingQuery = query(
  collection(db, 'leaderboard'),
  where('uid', '==', uid),           // Same player
  where('difficulty', '==', difficulty) // Same difficulty
);
const existingDocs = await getDocs(existingQuery);

// Step 2: If record exists, only update if new score is BETTER
if (!existingDocs.empty) {
  const isBetter = newTotal > existingTotal ||
    (newTotal === existingTotal && seconds < existingData.time);

  if (isBetter) {
    await updateDoc(...);  // Update the existing record
  }
  // If not better, do nothing (no duplicate!)
} else {
  await addDoc(...);  // First time playing this difficulty, create new record
}
```

**Why this is good:** The leaderboard stays clean — one entry per player per difficulty. No duplicates.

---

## 7. Clean Folder Structure

**What it means:** Files are organized by their **purpose**. UI files, logic files, style files, and config files each have their own folder. You never mix authentication code with game code in the same file.

**Simple analogy:** In a library, books are organized by category — science, history, fiction. You don't mix them randomly on one shelf.

**Our folder structure:**

```
client/features/game/
├── types.ts              ← Data definitions (what things look like)
├── constants.ts          ← Settings and config (API URLs, game settings)
│
├── hooks/                ← Game LOGIC (no UI code here)
│   ├── useGameTimer.ts   ← Timer logic
│   ├── useGameBoard.ts   ← Board logic
│   ├── useGif.ts         ← GIF fetching logic
│   ├── useLeaderboard.ts ← Firebase/score logic
│   └── index.ts          ← Barrel exports
│
├── components/           ← Game UI (no logic here)
│   ├── GameNav.tsx       ← Navigation bar
│   ├── DifficultySelector.tsx
│   ├── StatsBar.tsx      ← Shows goals, bombs, timer
│   ├── GameGrid.tsx      ← The tile grid
│   ├── SidePanel.tsx     ← Collected items sidebar
│   ├── GameOverPanel.tsx ← Win/loss screen
│   └── LeaderboardView.tsx
│
└── styles/               ← CSS files (one per concern)
    ├── base.css          ← Colors, fonts, resets
    ├── nav.css           ← Navigation styles
    ├── game.css          ← Grid, tiles, stats styles
    ├── gameover.css      ← Game over panel styles
    ├── leaderboard.css   ← Leaderboard table styles
    └── shared.css        ← Buttons, spinner styles
```

### Authentication is completely separate
```
client/features/auth/     ← Authentication code lives here
├── hooks/
│   ├── useAuth.ts        ← Login state
│   ├── useLogoutRedirect.ts
│   └── ...
```

**Why this is good:** When you want to find something, you know exactly where to look. Game logic? Go to `hooks/`. UI problem? Go to `components/`. Style issue? Go to `styles/`. Authentication bug? Go to `client/features/auth/`.

---

## Before vs After

| | Before (old code) | After (refactored) |
|---|---|---|
| **Files** | 1 file with 650 lines | 22 focused files |
| **Game logic** | Mixed with UI in same file | Separated into hooks |
| **Firebase** | Mixed with game code | Isolated in `useLeaderboard.ts` |
| **Authentication** | Imported directly in game file | Stays in `auth/` feature, connected via `page.tsx` |
| **CSS** | 1 big file (471 lines) | 6 small focused files |
| **Config** | Hardcoded in the component | Centralized in `constants.ts` |
| **Types** | Defined at top of component file | Shared `types.ts` file |
| **Page file** | Did everything (logic + UI + data) | Thin orchestrator (~156 lines, just wires things together) |
