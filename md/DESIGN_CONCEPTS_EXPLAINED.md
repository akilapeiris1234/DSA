# HeartSweeper — Design Concepts & Architecture

This document explains the 7 design concepts used in HeartSweeper, how each concept is applied, and the full project file structure with details.


## Complete File Structure

heartsweeper/
│
├── app/                              ← Next.js route pages (thin re-exports)
│   ├── layout.tsx                    ← Root layout (fonts, global CSS)
│   ├── page.tsx                      ← Home route → re-exports HomePage
│   ├── globals.css                   ← Global CSS (design tokens, shared)
│   ├── login/page.tsx                ← Login route → re-exports LoginPage
│   ├── signup/page.tsx               ← Signup route → re-exports SignupPage
│   ├── GameLanding/page.tsx          ← Game landing route → re-exports GameLanding
│   └── gamepage/page.tsx             ← Game page route → re-exports gamepage
│
├── client/                           ← All client-side code
│   ├── pages/                        ← Page-level orchestrators (layout + hooks)
│   │   ├── HomePage.tsx              ← Public landing page UI
│   │   ├── LoginPage.tsx             ← Login page layout
│   │   ├── SignupPage.tsx            ← Signup page layout
│   │   ├── GameLanding.tsx           ← Game landing page (auth guard + game UI)
│   │   └── gamepage.tsx              ← Game page orchestrator (hooks + components)
│   │
│   ├── components/                   ← Shared UI components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         ← Login form UI (pure presentational)
│   │   │   ├── SignupForm.tsx        ← Signup form UI (pure presentational)
│   │   │   └── UserStatus.tsx        ← User avatar + logout button
│   │   └── common/                   ← Shared components
│   │
│   ├── features/                     ← Feature-based modules
│   │   ├── auth/                     ← Authentication feature
│   │   │   ├── constants.ts          ← Auth image paths, config values
│   │   │   ├── hooks/                ← Auth logic hooks
│   │   │   │   ├── authHooks.ts      ← Barrel exports for auth hooks
│   │   │   │   ├── Auth.ts           ← Auth state management
│   │   │   │   ├── AuthGuard.ts      ← Route protection
│   │   │   │   ├── AuthRedirect.ts   ← Redirect if logged in
│   │   │   │   ├── LoginForm.ts      ← Login form logic
│   │   │   │   ├── SignupForm.ts     ← Signup form logic
│   │   │   │   └── LogoutRedirect.ts ← Redirect on logout
│   │   │   └── utils/
│   │   │       └── formatDisplayName.ts ← Display name formatting utility
│   │   │
│   │   ├── game/                     ← Game feature
│   │   │   ├── types.ts              ← Game types (Difficulty, Cell, etc.)
│   │   │   ├── constants.ts          ← Game config (grid sizes, API URLs, etc.)
│   │   │   ├── hooks/                ← Game logic hooks (imported directly)
│   │   │   │   ├── GameTimer.ts      ← Timer logic
│   │   │   │   ├── GameBoard.ts      ← Board generation, tile reveal, win/loss
│   │   │   │   ├── Gif.ts            ← GIF fetching on game over
│   │   │   │   └── Leaderboard.ts    ← Score saving + leaderboard listener
│   │   │   ├── components/           ← Game UI components
│   │   │   │   ├── HeartSweeperGame.tsx   ← Game landing orchestrator
│   │   │   │   ├── GameNav.tsx            ← Play Game / Leaderboard tabs
│   │   │   │   ├── DifficultySelector.tsx ← Beginner/Intermediate/Expert
│   │   │   │   ├── StatsBar.tsx           ← Goals, bombs, timer display
│   │   │   │   ├── GameGrid.tsx           ← Tile grid
│   │   │   │   ├── SidePanel.tsx          ← Collected hearts/carrots
│   │   │   │   ├── GameOverPanel.tsx      ← Win/loss screen + GIF
│   │   │   │   └── LeaderboardView.tsx    ← Leaderboard table
│   │   │   └── styles/               ← Game CSS (one file per concern)
│   │   │       ├── base.css          ← Design tokens, resets
│   │   │       ├── nav.css           ← Navigation styles
│   │   │       ├── game.css          ← Grid, tiles, stats
│   │   │       ├── gameover.css      ← Game over panel
│   │   │       ├── leaderboard.css   ← Leaderboard table
│   │   │       └── shared.css        ← Buttons, spinner
│   │   │
│   │   └── game-landing/             ← Game landing feature
│   │       └── components/
│   │           ├── GameHero.tsx       ← Hero image + logo
│   │           ├── PlayButton.tsx     ← Play Now button
│   │           └── HowToPlayButton.tsx ← How To Play button
│   │
│   └── lib/                          ← Shared client utilities
│       ├── gameConfig.ts             ← Game landing images, routes, animations
│       └── ui/                       ← Reusable UI primitives
│           ├── uiComponents.ts       ← Barrel exports
│           ├── ErrorAlert.tsx         ← Error message display
│           ├── FormInput.tsx          ← Styled input field
│           └── LoadingButton.tsx      ← Submit button with loading
│
├── lib/                              ← Shared (client + server) code
│   ├── core/
│   │   └── events.ts                 ← EventBus (pub/sub event system)
│   └── data/
│       ├── index.ts                  ← Data layer barrel
│       └── features/auth/
│           ├── types/index.ts        ← AuthUser, AuthState, AuthResult types
│           └── services/
│               └── authService.ts    ← Auth business logic + event emitting
│
├── server/                           ← Server-side code
│   └── lib/
│       ├── firebase/
│       │   └── firebaseClient.ts     ← Firebase SDK wrapper (singleton)
│       ├── repositories/
│       │   └── userRepository.ts     ← User profile CRUD operations
│       └── utils/
│           └── errorHandler.ts       ← Firebase error → friendly message
│
└── components/                       ← Legacy shared components
    ├── Navbar.tsx                    ← Navigation bar
    └── Footer.tsx                    ← Footer
```

---

## The 7 Design Concepts

---

### 1. Low Coupling

> **What it means:** Each part of the code works on its own. It does NOT reach into another part's code. Parts talk to each other through **props** (passing data) or **callbacks** (passing functions).

**Why it matters:** If you change one file, other files should NOT break.

#### How HeartSweeper uses it

**Components receive data through props — they don't import logic:**
```tsx
// GameGrid.tsx — receives board data, does NOT import Firebase or timer
function GameGrid({ board, gridSize, tileSize, onReveal }) {
  // Just renders tiles using the data it was given
  // Does NOT know where the board came from
}
```

**Hooks receive callbacks — they don't own other hooks:**
```tsx
// useGameBoard receives timer functions, does NOT import useGameTimer
function useGameBoard({ onTimerStart, onTimerStop, onTimerReset }) {
  // When a tile is clicked, calls onTimerStart()
  // Does NOT know how the timer works inside
}
```

**Services are called through abstractions:**
```tsx
// useLoginForm calls authService — NOT Firebase directly
const result = await authService.loginWithEmail(credentials);
// If Firebase is replaced with another auth provider,
// only authService.ts changes, not 6 different hooks
```

**What we fixed:** `HeartSweeperGame.tsx` accepted a `user` prop it never used — this created an unnecessary dependency. We removed it.

---

### 2. High Cohesion

> **What it means:** Each file does **one job**, and ALL the code related to that job is in that **one** file. Nothing is spread across multiple places.

**Why it matters:** When you look for something, you know exactly which file to open.

#### How HeartSweeper uses it

| File | One job only |
|---|---|
| `GameTimer.ts` | Timer: start, stop, reset, format — nothing else |
| `GameBoard.ts` | Board: generate, reveal, win/loss — nothing else |
| `Gif.ts` | GIF: fetch on game over — nothing else |
| `Leaderboard.ts` | Scores: save + load from Firebase — nothing else |
| `LoginForm.ts` | Login form: email, password, submit — nothing else |
| `SignupForm.ts` | Signup form: name, email, password, submit — nothing else |
| `authService.ts` | All auth operations: login, signup, Google, logout — all in one place |
| `userRepository.ts` | All user profile DB operations: create, get, update — all in one place |
| `errorHandler.ts` | All Firebase error messages — all defined in one file |

---

### 3. Separation of Concerns

> **What it means:** Different types of things go in different files. Config stays separate from logic. Logic stays separate from UI. UI stays separate from styles.

**Why it matters:** If you have a CSS bug, you go to a CSS file. If you have a logic bug, you go to a hook. You never search through a 650-line file.

#### The 5 layers in HeartSweeper

| Layer | Example files | What goes here |
|---|---|---|
| **Types** | `types.ts` | Data shapes only — no logic |
| **Constants** | `constants.ts`, `auth/constants.ts` | Config values — API URLs, image paths |
| **Logic (Hooks)** | `GameBoard.ts`, `LoginForm.ts` | Business logic — no JSX/HTML |
| **UI (Components)** | `GameGrid.tsx`, `LoginForm.tsx` | HTML/JSX rendering — no Firebase, no business logic |
| **Styles** | `game.css`, `globals.css` | CSS only — separated by concern |

**What we fixed:**
- `UserStatus.tsx` had display name formatting logic (email parsing, capitalizing). We extracted it to `formatDisplayName.ts` utility.
- `LoginPage.tsx` and `SignupPage.tsx` had inline `<style jsx>` CSS. We moved it to `globals.css`.
- `LoginPage.tsx`, `SignupPage.tsx`, and `HomePage.tsx` had hardcoded image paths. We moved them to `auth/constants.ts`.

---

### 4. Event-Driven Programming

> **What it means:** Parts of the code talk to each other by sending **events** (announcements). One part says "something happened!" and other parts can listen and react. They don't call each other directly.

**Why it matters:** The part that sends an event does NOT need to know who listens to it. This keeps things loosely connected.

#### How HeartSweeper uses it

**The EventBus** (`lib/core/events.ts`) is the central messaging system:

```
┌─────────────────────┐         ┌──────────────────────┐
│  useGameBoard       │─emit──▶ │  EventBus            │
│  "GAME_OVER"        │         │                      │
└─────────────────────┘         │  Broadcasts to all   │
                                │  subscribers          │
┌─────────────────────┐         │                      │
│  authService        │─emit──▶ │                      │
│  "LOGIN_SUCCESS"    │         │                      │
│  "AUTH_ERROR"       │         └──────────────────────┘
│  "LOGOUT"           │                   │
└─────────────────────┘                   │
                                          ▼
                                ┌──────────────────────┐
                                │  useAuth listens to  │
                                │  "AUTH_ERROR"        │
                                │                      │
                                │  HeartSweeperGame    │
                                │  emits "GAME_STARTED"│
                                └──────────────────────┘
```

**Auth events:**
```
LOGIN_SUCCESS  → emitted by authService after successful login
SIGNUP_SUCCESS → emitted by authService after successful signup
AUTH_ERROR     → emitted by authService on failure, listened by useAuth
LOGOUT         → emitted by authService after sign out
GOOGLE_LOGIN   → emitted by authService after Google auth
USER_PROFILE_CREATED → emitted after new user profile is saved
```

**Game events:**
```
GAME_STARTED          → emitted when Play Now is clicked
HOW_TO_PLAY_REQUESTED → emitted when How To Play is clicked
GAME_OVER             → emitted by useGameBoard when game ends
SCORE_SAVED           → emitted by useLeaderboard after saving to Firebase
```

---

### 5. Interoperability

> **What it means:** Hooks and components can be **reused** in different places. They are not locked to one specific page.

**Why it matters:** When you build new features, you reuse existing parts instead of rewriting them.

#### How HeartSweeper uses it

**DifficultySelector** — used in 2 different views:
```tsx
// Game view
<DifficultySelector difficulty={difficulty} onSelect={setDifficulty} />

// Leaderboard view (same component, different context)
<DifficultySelector difficulty={difficulty} onSelect={setDifficulty}
  style={{ marginBottom: '20px' }} />
```

**useLeaderboardListener** — independent from useLeaderboard:
```tsx
// Can be used on ANY page that needs leaderboard data
// Does NOT need score-saving logic
const { leaderboard } = useLeaderboardListener(difficulty, true);
```

**Shared UI primitives** — used across auth pages:
```tsx
// ErrorAlert, FormInput, LoadingButton are used in both LoginForm and SignupForm
<ErrorAlert message={error} />
<FormInput label="Email" value={email} onChange={setEmail} />
<LoadingButton loading={loading}>Login</LoadingButton>
```

**formatDisplayName** — utility that can be used anywhere:
```tsx
// Used in UserStatus, but can be used in any component
// that needs to display a user's name
const { displayName, initial, shortName } = formatDisplayName(user);
```

---

### 6. Virtual Identity

> **What it means:** Each player has **one identity** in the system. The system tracks user profiles, prevents duplicate entries, and derives display names from multiple sources.

**Why it matters:** The leaderboard stays clean, and users see their correct name everywhere.

#### How HeartSweeper uses it

**One leaderboard entry per player per difficulty:**
```tsx
// useLeaderboard.ts — checks before saving
const existingQuery = query(
  collection(db, 'leaderboard'),
  where('uid', '==', uid),           // Same player
  where('difficulty', '==', difficulty) // Same difficulty
);

// If exists → update only if better score
// If not exists → create new entry
// Result: Never duplicates, always best score
```

**Display name derived from multiple sources:**
```tsx
// formatDisplayName.ts — priority order:
// 1. user.displayName (set by Google or signup)
// 2. email prefix (john from john@email.com)
// 3. "Guest Player" (fallback)
```

**User profiles tracked in Firestore:**
```tsx
// userRepository.ts — manages user identity data
await createProfile(uid, { email, fullName, photoURL });
await updateLastActive(uid);
```

---

### 7. Clean Folder Structure

> **What it means:** Files are organized by their **purpose and feature**. You never mix authentication code, game logic, and UI rendering in the same file.

**Why it matters:** Any developer can look at the folder name and instantly know what kind of code is inside.

#### Rules followed

| Rule | Example |
|---|---|
| Auth code goes in `features/auth/` | `Auth.ts`, `LoginForm.ts`, `authService.ts` |
| Game code goes in `features/game/` | `GameBoard.ts`, `GameGrid.tsx`, `constants.ts` |
| Logic (hooks) never contain JSX | `GameTimer.ts` has zero HTML |
| Components never contain Firebase calls | `GameGrid.tsx` does NOT import Firebase |
| Config values never live in components | `API_BASE_URL` is in `constants.ts`, not `GameBoard.ts` |
| CSS never lives inside components | Shake animation is in `globals.css`, not `LoginPage.tsx` |
| Types are shared, not duplicated | `Difficulty` type is defined once in `types.ts` |
| Route pages are thin re-exports | `app/gamepage/page.tsx` just imports from `client/pages/gamepage.tsx` |

#### Data flow through layers

```
┌───────────────────────────────────────────────────────────┐
│                    app/ (Route Pages)                      │
│   Thin re-exports only — 2–3 lines each                   │
│   e.g. import HeartSweeper from "@/client/pages/gamepage" │
│        export default HeartSweeper;                       │
└─────────────────────┬─────────────────────────────────────┘
                      │ re-exports
                      ▼
┌───────────────────────────────────────────────────────────┐
│               client/pages/ (Orchestrators)                │
│   Page-level layout — composes hooks + components          │
│   Example: gamepage.tsx (~157 lines)                       │
└────────┬────────────────────────────┬─────────────────────┘
         │ uses                       │ renders
         ▼                            ▼
┌────────────────────┐   ┌──────────────────────────────────┐
│   hooks/ (Logic)   │   │   components/ (UI)                │
│   GameTimer        │   │   GameGrid, StatsBar, SidePanel   │
│   GameBoard        │   │   GameOverPanel, LeaderboardView   │
│   Leaderboard      │   │   (pure presentational — props     │
│   Gif              │   │    only, no Firebase/logic)        │
└────────┬───────────┘   └──────────────────────────────────┘
         │ reads
         ▼
┌───────────────────────────────────────────────────────────┐
│           constants.ts / types.ts (Config & Types)         │
│   API_BASE_URL, CONFIGS, ICONS, Difficulty, Cell, etc.     │
└───────────────────────────────────────────────────────────┘
```

---

## Before vs After

| Aspect | Before (monolithic) | After (clean architecture) |
|---|---|---|
| **Files** | 1 file with 650 lines | 22+ focused files |
| **Game logic** | Mixed with UI | Isolated in hooks |
| **Firebase** | Called directly in components | Wrapped in services and repositories |
| **Auth code** | Could be mixed anywhere | Stays in `features/auth/` |
| **CSS** | Inline `<style jsx>` in components | Separate CSS files + `globals.css` |
| **Config** | Hardcoded in components | Centralized in `constants.ts` files |
| **Types** | Defined at top of component | Shared `types.ts` per feature |
| **Display name logic** | Inside UI component | Extracted to utility function |
| **User identity** | Duplicate leaderboard entries | One entry per player per difficulty |
| **Page files** | Did everything | `app/` routes are 2-line re-exports; logic lives in `client/pages/` |
