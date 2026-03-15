# Software Architecture: Low Coupling & High Cohesion

This document outlines the software architecture of the HeartSweeper project, specifically addressing how the code is structured to achieve **Low Coupling** and **High Cohesion**.

## 1. Code Structure

The project follows a "Feature-Based" folder structure. Instead of grouping all components together and all hooks together, files are grouped by the **feature** they belong to (e.g., Game, Authentication).

### Directory Layout

```text
features/game/
├── types.ts              # Shared data interfaces (Models)
├── constants.ts          # Configuration values (no logic)
│
├── hooks/                # PURE LOGIC (High Cohesion)
│   ├── GameTimer.ts      # Handles time tracking only
│   ├── GameBoard.ts      # Handles board state & win/loss logic
│   ├── Leaderboard.ts    # Handles Firebase interaction
│   └── Gif.ts            # Handles external API calls
│
├── components/           # PURE UI (Low Coupling)
│   ├── GameGrid.tsx      # Renders the board based on props
│   ├── StatsBar.tsx      # Displays score/time
│   ├── DifficultySelector.tsx
│   └── GameOverPanel.tsx
│
└── styles/               # CSS Modules
    ├── game.css
    └── leaderboard.css

app/                      # ROUTING (Orchestrators)
└── game/page.tsx         # Connects Hooks to Components
```

---

## 2. High Cohesion

**Definition:** High cohesion means that code effectively belongs together. A file should have a single responsibility and contain everything required to fulfill that responsibility.

**How we use it:**
We separated logic from UI. Logic lives in custom hooks (`hooks/`), and UI lives in React components (`components/`).

### Examples in Code:

1.  **`GameTimer.ts`**: This file contains *only* logic related to starting, stopping, and formatting the time. It does not know about the grid, the score, or the API.
2.  **`Leaderboard.ts`**: This file handles *only* the communication with Firebase (reading/writing scores). It does not handle game rules.
3.  **`components/StatsBar.tsx`**: This component *only* cares about how to display the numbers. It doesn't calculate them.

**Benefit:** If the timer breaks, we know exactly where to look (`GameTimer.ts`) without searching through thousands of lines of mixed code.

---

## 3. Low Coupling

**Definition:** Low coupling means components are independent. A change in one module should not break another module. They interact through defined interfaces (props or events) rather than direct dependency.

**How we use it:**
Components are "dumb"—they receive data via **props** and communicate actions via **callbacks**. They do not import logic hooks directly.

### Examples in Code:

1.  **`GameGrid` Component**:
    *   It receives `board`, `gridSize`, and `onReveal` as props.
    *   It does **not** know how the board was generated.
    *   It does **not** know what happens when a tile is clicked (it just calls `onReveal`).
    *   *Result:* We can reuse this grid for a "Preview" mode or a "Replay" mode easily.

2.  **`GameBoard` Hook**:
    *   It accepts `onTimerStart` and `onTimerStop` functions as arguments.
    *   It does **not** import the Timer hook directly.
    *   *Result:* We can swap the timer logic out entirely without breaking the game board logic.

---

## 4. Relationships & Orchestration

If components and hooks are loosely coupled, how do they talk to each other?

### The "Orchestrator" Pattern (`app/game/page.tsx`)
The page file acts as the "manager." It imports the isolated parts and wires them together.

1.  **Instantiate Hooks:** The page calls `useGameBoard()` and `useGameTimer()`.
2.  **Pass Data:** The page takes the `timer` value from `useGameTimer` and passes it into `<StatsBar time={timer} />`.
3.  **Handle Events:** The page passes the `timer.start` function into `useGameBoard` so the board can start the timer when the player moves.

### Event-Driven Communication
For distant relationships (like the Game ending -> Leaderboard updating), we use an **Event Bus**.
*   **Source:** `GameBoard.ts` emits a `GAME_OVER` event.
*   **Listener:** `Leaderboard.ts` listens for `GAME_OVER` to save the score.
*   **Benefit:** The game logic doesn't strictly depend on the leaderboard existing. The game still works even if the leaderboard feature is removed.