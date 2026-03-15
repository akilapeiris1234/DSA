# Separation of Concerns — simple guide and examples

## What "Separation of Concerns" means

Separation of Concerns is about keeping different parts of the code separate. Each file or layer has one clear job. Styling code goes in CSS. Logic goes in hooks. Rendering goes in components. Pages just wire things together. This makes the code easier to find, change, and test.

## Why it is useful

- You can change one part without affecting others.
- It is easy to find code: UI is in components, logic is in hooks, data is in services.
- People can work on different parts at the same time (UI team, logic team, styling team).
- Easier to debug: if a problem occurs, you know where to look.

## The 5 layers in this project

The code is organized into 5 clear layers. Each layer has a specific job:

1. **Orchestration (Pages):** Wire hooks and components together. Decide what shows on the page.
2. **UI (Components):** Render buttons, grids, text. Do not handle logic or fetch data.
3. **Logic (Hooks):** Manage state, fetch data, run game rules. Do not render UI.
4. **Data (Services):** Database and API calls. Do not touch UI or game logic.
5. **Configuration (Constants):** Static settings like grid size, bomb count. No logic here.

## Files that show Separation of Concerns


**Explanation:** The page imports hooks and components. It does not contain logic or styling. It just says "use the timer hook, use the board hook, show these components." This is thin orchestration.

### Layer 2: UI (Components) — `components/game/GameGrid.tsx`
```tsx
interface GameGridProps {
    board: Cell[][];
    gridSize: number;
    tileSize: number;
    onReveal: (r: number, c: number) => void;
}

export default function GameGrid({ board, gridSize, tileSize, onReveal }: GameGridProps) {
    return (
        <div className="grid-container">
            <div id="grid" className="grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {board.map((row, ri) =>
                    row.map((cell, ci) => (
                        <div key={`${ri}-${ci}`} className={`tile ${cell.revealed ? 'revealed' : ''}`} 
                             onClick={() => onReveal(ri, ci)}>
                            {/* render cell content */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

```
**Explanation:** The hook manages game state (board, found items, game over flag) and game rules (what happens when you click a tile). It does not render anything. It imports UI components or Firebase code.

### Layer 4: Data (Services) — `lib/data/features/auth/services/authService.ts`
```ts
export class AuthService {
  async loginWithEmail(credentials: AuthCredentials) {
    try {
      // Call Firebase client (not UI component)
      const credential = await firebaseClient.signInWithEmail(credentials.email, credentials.password);
      // Call repository (not UI component)
      await userRepository.updateLastActive(credential.user.uid);
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      eventBus.emit({ type: "AUTH_ERROR", payload: { error: message } });
      return { success: false, error: message };
    }
  }
}
```
**Explanation:** The service handles database and API calls. It uses `firebaseClient` and `userRepository` to talk to Firebase. It does not import components or hooks. Pure data layer.

### Layer 5: Configuration (Constants) — `lib/game/constants.ts`
```ts
export const CONFIGS: Record<Difficulty, GameConfig> = {
    beginner: { size: 8, bombs: 10 },
    intermediate: { size: 12, bombs: 25 },
    expert: { size: 16, bombs: 45 },
};

export const ICONS = {
    heart: '/icons/heart.png',
    carrot: '/icons/carrot.png',
    bomb: '/icons/blast.png',
} as const;
```
**Explanation:** Constants live here. The hook uses `CONFIGS[difficulty].size` to know the grid size. If you want to change bomb count, edit this file only.

## How the layers talk to each other

```
Page (app/game/page.tsx)
    |
    ├─> Hooks (useGameBoard, useGameTimer)
    |       |
    |       └─> Services (authService, useLeaderboard)
    |               |
    |               └─> Data Layer (firebaseClient, userRepository)
    |
    └─> Components (GameGrid, StatsBar)
            |
            └─> Constants (ICONS, CONFIGS)
                |
                └─> Styles (game.css, nav.css)
```

**Data flows down (page → hooks → services → data layer).**
**Events flow up (data layer → eventBus → hooks → page).**

## Benefits of Separation of Concerns

| Layer | Benefit |
|---|---|
| **Orchestration** | Easy to see what the page does at a glance. |
| **UI** | Easy to reuse components in different pages. Easy to change design. |
| **Logic** | Easy to test. Easy to change rules (e.g., win condition). |
| **Data** | Easy to swap auth provider or database. |
| **Configuration** | Easy to tweak settings without touching code. |

## Checklist for new code

- Does the component only render UI? (It should not fetch data or handle complex logic.)
- Does the hook only manage state and logic? (It should not render UI or do styling.)
- Is the service only talking to a database or API? (It should not import components.)
- Are all settings in constants? (They should be, so you can change them without editing logic.)
- Can you understand the page at a glance? (If not, maybe there is too much logic on the page.)

---

If you want, I can create a diagram showing the 5 layers or add code flow examples.

//3.14.2025
