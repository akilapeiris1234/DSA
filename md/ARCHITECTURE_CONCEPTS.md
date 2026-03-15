# 🏗️ HeartSweeper — Architecture & Design Concepts

This document explains **how** and **where** the following software-engineering concepts are applied throughout the HeartSweeper codebase.

---

## 📂 Project Structure At A Glance

```
heartsweeper/
├── app/                          # Next.js route pages (thin re-exports)
├── client/                       # Client-side code
│   ├── components/auth/          # Reusable auth UI components
│   ├── features/
│   │   ├── auth/                 # Auth feature module
│   │   │   ├── hooks/            # Auth, LoginForm, SignupForm…
│   │   │   ├── utils/            # formatDisplayName
│   │   │   └── constants.ts      # Auth image paths
│   │   ├── game/                 # Game feature module
│   │   │   ├── components/       # GameGrid, GameOverPanel, StatsBar…
│   │   │   ├── hooks/            # GameBoard, GameTimer, Gif…
│   │   │   ├── styles/           # game.css, leaderboard.css…
│   │   │   ├── types.ts          # Cell, Difficulty, LeaderboardEntry
│   │   │   └── constants.ts      # Grid configs, API keys
│   │   └── game-landing/         # Landing page components
│   ├── lib/                      # Shared client config & UI primitives
│   └── pages/                    # Page-level orchestrators
├── lib/                          # Shared domain layer
│   ├── core/events.ts            # EventBus (pub/sub)
│   └── data/features/auth/       # Auth types & AuthService
├── server/                       # Server-side infrastructure
│   └── lib/
│       ├── firebase/             # FirebaseClient (singleton)
│       ├── repositories/         # UserRepository (data access)
│       └── utils/                # errorHandler
├── components/                   # Global layout (Navbar, Footer)
└── public/                       # Static assets (icons, images)
```

---

## 1️⃣ Low Coupling

>>> **Principle:** Modules depend on *abstractions*, not on each other's internals. Changing one module does not ripple through the rest.

### How it's used

| Evidence | Files |
|---|---|
| **Hooks never call Firebase directly.** They call `authService` — an abstraction layer. If you swap Firebase for Supabase, only the service and firebase wrapper change; hooks stay untouched. | `LoginForm.ts`, `SignupForm.ts`, `Auth.ts` |
| **EventBus decouples emitters from listeners.** `AuthService` emits `LOGIN_SUCCESS`; `Auth` hook subscribes to `AUTH_ERROR`. Neither knows about the other. | `events.ts` ↔ `authService.ts` ↔ `Auth.ts` |
| **FirebaseClient wraps the Firebase SDK** behind methods like `signInWithEmail()` and `signInWithGoogle()`. The rest of the app calls these wrapper methods. | `firebaseClient.ts` |
| **Presentational components receive data as props** — `GameGrid` gets `board` and `onReveal` via props, never importing hooks or services itself. Uses `next/image` `Image` component for optimized images. | `GameGrid.tsx`, `GameOverPanel.tsx`, `StatsBar.tsx`, `SidePanel.tsx` |

### Key files

- [`LoginForm.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/LoginForm.ts) — *imports `authService`, never Firebase*
- [`authService.ts`](file:///d:/HeartSweeper/heartsweeper/lib/data/features/auth/services/authService.ts) — *calls `firebaseClient` + `userRepository`, not raw SDK*
- [`firebaseClient.ts`](file:///d:/HeartSweeper/heartsweeper/server/lib/firebase/firebaseClient.ts) — *Firebase SDK wrapper (singleton)*
- [`GameGrid.tsx`](file:///d:/HeartSweeper/heartsweeper/client/features/game/components/GameGrid.tsx) — *pure presentational, no direct state management*

---

## 2️⃣ High Cohesion

> **Principle:** Each file / module has **one clear responsibility** and all code inside it relates to that single purpose.

### How it's used

| Module | Single responsibility |
|---|---|
| `GameTimer` | Only manages **timer** state (start, stop, reset, format) |
| `GameBoard` | Only manages **board generation, tile reveal, win/loss detection** |
| `Gif` | Only fetches a **Giphy GIF** based on game outcome |
| `Leaderboard` | Only handles **saving scores** and **listening to leaderboard data** |
| `Auth` | Only tracks **auth state** (user, loading, error) |
| `LoginForm` | Only handles **login form** state and submission logic |
| `SignupForm` | Only handles **signup form** state and submission logic |
| `AuthGuard` | Only provides **route protection** data |
| `types.ts` (game) | Only defines game-related **type interfaces** |
| `constants.ts` (game) | Only stores **game configuration** (grid sizes, API URLs) |
| `errorHandler.ts` | Only maps **Firebase error codes** to user-friendly messages |

### Key files

- [`GameTimer.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/hooks/GameTimer.ts) — *37 lines, timer concern only*
- [`Gif.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/hooks/Gif.ts) — *43 lines, GIF fetching only*
- [`types.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/types.ts) — *type definitions only, no logic*
- [`errorHandler.ts`](file:///d:/HeartSweeper/heartsweeper/server/lib/utils/errorHandler.ts) — *error mapping only*

---

## 3️⃣ Separation of Concerns

> **Principle:** UI, business logic, data access, and configuration live in **different files and layers** so each can change independently.

### Architectural layers

```
┌──────────────────────────────────┐
│       Pages (orchestrators)      │  gamepage.tsx, GameLanding.tsx, LoginPage.tsx
├──────────────────────────────────┤
│    UI Components (presentational)│  GameGrid, GameOverPanel, LoginForm
├──────────────────────────────────┤
│    Hooks (state + logic)         │  useLoginForm, useGameBoard, useAuth
├──────────────────────────────────┤
│    Services (business rules)     │  AuthService
├──────────────────────────────────┤
│    Data Access (repositories)    │  UserRepository, FirebaseClient
├──────────────────────────────────┤
│    Core Infrastructure           │  EventBus, types, constants
└──────────────────────────────────┘
```

### How it's used

| Separation | Example |
|---|---|
| **Logic ≠ UI** — Login form *logic* is in `LoginForm.ts` hook; login form *rendering* is in `LoginForm.tsx` component; the *page layout* is in `LoginPage.tsx`. | `LoginForm.ts` → `LoginForm.tsx` → `LoginPage.tsx` |
| **Config ≠ Code** — Image paths, grid sizes, API URLs, and animation timings live in dedicated `constants.ts` / `gameConfig.ts` files, not hard-coded in components. | `constants.ts` (auth), `constants.ts` (game), `gameConfig.ts` |
| **Styling ≠ Components** — CSS is extracted into feature-scoped files under `styles/`. | `game.css`, `gameover.css`, `leaderboard.css`, `nav.css`, `shared.css`, `base.css` |
| **Types ≠ Implementation** — Auth types have no Firebase imports; game types have no React imports. | `lib/data/features/auth/types/index.ts`, `client/features/game/types.ts` |
| **Error handling ≠ Service logic** — `mapAuthError()` lives in its own utility file, not inside AuthService. | `errorHandler.ts` |

### Key files

- [`LoginPage.tsx`](file:///d:/HeartSweeper/heartsweeper/client/pages/LoginPage.tsx) — *page orchestrator: layout only*
- [`LoginForm.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/LoginForm.ts) — *logic only, no JSX*
- [`constants.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/constants.ts) — *config values only*
- [`gameConfig.ts`](file:///d:/HeartSweeper/heartsweeper/client/lib/gameConfig.ts) — *image paths, routes, animation timings*
- [`auth types`](file:///d:/HeartSweeper/heartsweeper/lib/data/features/auth/types/index.ts) — *pure types, zero Firebase imports*

---

## 4️⃣ Event-Driven Programming

> **Principle:** Instead of direct function calls between parts of the system, components **emit events** and other parts **subscribe** to react. This keeps the system loosely-coupled and extensible.

### The EventBus (`lib/core/events.ts`)

The central `EventBus` class implements a **publish/subscribe** pattern with TypeScript type safety:

```typescript
// Typed event unions keep events predictable
type AuthEvent =
  | { type: 'LOGIN_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'SIGNUP_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | ...

type GameEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_OVER'; payload: { won: boolean; hearts: number; ... } }
  | { type: 'SCORE_SAVED'; payload: { uid: string; difficulty: string } }
  | ...
```

### How events flow through the app

| Event | Emitted by | Listened by | Purpose |
|---|---|---|---|
| `LOGIN_SUCCESS` | `AuthService.loginWithEmail()` | *(extensible)* | Notify app of successful login |
| `SIGNUP_SUCCESS` | `AuthService.signupWithEmail()` | *(extensible)* | Notify app of successful signup |
| `AUTH_ERROR` | `AuthService` (all methods) | `useAuth` hook | Display error to user |
| `LOGOUT` | `AuthService.logout()` | *(extensible)* | Notify app of logout |
| `GAME_STARTED` | `HeartSweeperGame` | *(extensible)* | Track game start |
| `GAME_OVER` | `GameBoard` hook | *(extensible)* | Broadcast win/loss result |
| `SCORE_SAVED` | `Leaderboard` hook | *(extensible)* | Confirm score persistence |

### Key files

- [`events.ts`](file:///d:/HeartSweeper/heartsweeper/lib/core/events.ts) — *EventBus class + typed event definitions*
- [`authService.ts`](file:///d:/HeartSweeper/heartsweeper/lib/data/features/auth/services/authService.ts) — *emits auth events on login/signup/error*
- [`Auth.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/Auth.ts) — *subscribes to `AUTH_ERROR` events*
- [`GameBoard.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/hooks/GameBoard.ts) — *emits `GAME_OVER` when game ends*
- [`HeartSweeperGame.tsx`](file:///d:/HeartSweeper/heartsweeper/client/features/game/components/HeartSweeperGame.tsx) — *emits `GAME_STARTED` and `HOW_TO_PLAY_REQUESTED`*

---

## 5️⃣ Interoperability

> **Principle:** Modules are designed to be **reusable across different contexts** without modification. External services (APIs, Firebase, Giphy) are integrated through clean interfaces.

### How it's used

| Evidence | Files |
|---|---|
| **`useAuthGuard` is reusable on any protected page** — it just returns `{user, loading, error}`. Any page can use it without knowing about Firebase. | `AuthGuard.ts` |
| **`useAuthRedirect` is reusable on any login/signup page** — just call it with a redirect path. | `AuthRedirect.ts` |
| **Shared types** (`AuthUser`, `AuthCredentials`, `Cell`, `Difficulty`) are importable by any module. | `auth/types/index.ts`, `game/types.ts` |
| **`errorHandler`** can be used by any service that handles Firebase errors, not just auth. | `errorHandler.ts` |
| **Barrel exports** (`authHooks.ts`, `uiComponents.ts`) give clean import paths for other modules. | `auth/hooks/authHooks.ts`, `client/lib/ui/uiComponents.ts` |
| **External API integration** — game board data comes from `marcconrad.com/uob/heart/api.php` via CORS proxy; GIFs come from Giphy API. Both are accessed through clean `fetch` calls with error handling. | `GameBoard.ts`, `Gif.ts` |
| **Firebase interoperability** — `FirebaseClient` singleton wraps the entire Firebase SDK so the rest of the app uses the same clean interface. | `firebaseClient.ts` |
| **`gameConfig.ts`** is shared across `GameHero`, `PlayButton`, and `HeartSweeperGame`. | `gameConfig.ts` |

### Key files

- [`AuthGuard.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/AuthGuard.ts) — *reusable on any protected route*
- [`AuthRedirect.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/AuthRedirect.ts) — *configurable redirect path*
- [`auth/types/index.ts`](file:///d:/HeartSweeper/heartsweeper/lib/data/features/auth/types/index.ts) — *shared type contracts*
- [`authHooks.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/hooks/authHooks.ts) — *barrel exports for clean imports*
- [`GameBoard.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/hooks/GameBoard.ts) — *external API integration*

---

## 6️⃣ Virtual Identity

> **Principle:** Users are represented by a **virtual profile** (display name, avatar, UID) that is constructed from multiple data sources and can be displayed throughout the app.

### How it's used

| Aspect | Implementation | Files |
|---|---|---|
| **Firebase User → AuthUser mapping** | `AuthService.mapFirebaseUser()` converts raw Firebase `User` into an app-level `AuthUser` type (`uid`, `email`, `displayName`, `photoURL`) | `authService.ts` |
| **User profile in Firestore** | `UserRepository.createProfile()` stores `fullName`, `email`, `photoURL`, timestamps | `userRepository.ts` |
| **Display name formatting** | `formatDisplayName()` derives a display name with priority: `displayName` → email prefix → "Player". Also generates `initial` and `shortName`. | `formatDisplayName.ts` |
| **Leaderboard identity** | Scores are saved with `displayName` and `uid` so each player appears on the leaderboard with their identity. | `Leaderboard.ts` |
| **Auth-guarded pages** | `useAuthGuard` returns the authenticated `user` object so the page knows *who* is viewing it. | `AuthGuard.ts` |

### Key files

- [`authService.ts`](file:///d:/HeartSweeper/heartsweeper/lib/data/features/auth/services/authService.ts) — *`mapFirebaseUser()` on lines 161–170*
- [`userRepository.ts`](file:///d:/HeartSweeper/heartsweeper/server/lib/repositories/userRepository.ts) — *CRUD for user profiles*
- [`formatDisplayName.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/auth/utils/formatDisplayName.ts) — *display name derivation logic*
- [`Leaderboard.ts`](file:///d:/HeartSweeper/heartsweeper/client/features/game/hooks/Leaderboard.ts) — *saves identity data with scores*

---

## 7️⃣ Clean Folder Structure

> **Principle:** UI, authentication, and game logic are **never mixed in the same file.** Code is organized by feature, with each feature containing its own hooks, components, styles, types, and constants.

### Rules followed

| Rule | How it's enforced |
|---|---|
| **Feature-based folders** | `client/features/auth/`, `client/features/game/`, `client/features/game-landing/` — each feature is self-contained. |
| **Hooks in `hooks/`** | Auth hooks in `auth/hooks/`, game hooks in `game/hooks/`. |
| **Components in `components/`** | Game UI in `game/components/`, landing UI in `game-landing/components/`, auth UI in `client/components/auth/`. |
| **Styles in `styles/`** | Game CSS split into `base.css`, `game.css`, `gameover.css`, `leaderboard.css`, `nav.css`, `shared.css`. |
| **Types in `types.ts`** | Game types in `game/types.ts`, auth types in `lib/data/features/auth/types/`. |
| **Constants in `constants.ts`** | Each feature has its own constants file. |
| **Server code separated** | Firebase wrapper, repositories, and error handler are in `server/lib/` — never imported into components directly. |
| **Shared infrastructure isolated** | EventBus in `lib/core/events.ts`, auth service in `lib/data/features/auth/services/`. |
| **Pages are thin orchestrators** | `app/` routes are 2-line re-exports; logic lives in `client/pages/` (e.g. `gamepage.tsx`, `GameLanding.tsx`). |
| **Barrel exports** | `authHooks.ts` and `uiComponents.ts` provide clean import paths. |

### Folder contracts

```
client/features/auth/
├── hooks/           ← State management & logic
│   ├── authHooks.ts ← Barrel export
│   ├── Auth.ts
│   ├── AuthGuard.ts
│   ├── AuthRedirect.ts
│   ├── LoginForm.ts
│   ├── LogoutRedirect.ts
│   └── SignupForm.ts
├── utils/           ← Pure utility functions
│   └── formatDisplayName.ts
└── constants.ts     ← Feature-specific config

client/features/game/
├── components/      ← Presentational UI
│   ├── DifficultySelector.tsx
│   ├── GameGrid.tsx
│   ├── GameNav.tsx
│   ├── GameOverPanel.tsx
│   ├── HeartSweeperGame.tsx
│   ├── LeaderboardView.tsx
│   ├── SidePanel.tsx
│   └── StatsBar.tsx
├── hooks/           ← State management & logic (imported directly)
│   ├── GameBoard.ts
│   ├── GameTimer.ts
│   ├── Gif.ts
│   └── Leaderboard.ts
├── styles/          ← CSS per concern
│   ├── base.css
│   ├── game.css
│   ├── gameover.css
│   ├── leaderboard.css
│   ├── nav.css
│   └── shared.css
├── types.ts         ← Type definitions
└── constants.ts     ← Grid configs, API keys
```

---

## 🔗 Summary Table

| Concept | Where to see it | Primary files |
|---|---|---|
| **Low Coupling** | Hooks → Service → Firebase wrapper chain | `LoginForm.ts`, `authService.ts`, `firebaseClient.ts` |
| **High Cohesion** | One-responsibility hooks and utilities | `GameTimer.ts`, `Gif.ts`, `errorHandler.ts` |
| **Separation of Concerns** | 5-layer architecture (Pages → Components → Hooks → Services → Data) | `LoginPage.tsx`, `GameGrid.tsx`, `GameBoard.ts`, `authService.ts`, `userRepository.ts` |
| **Event-Driven Programming** | Typed pub/sub EventBus | `events.ts`, `authService.ts`, `Auth.ts`, `GameBoard.ts` |
| **Interoperability** | Reusable hooks, shared types, barrel exports, external API integrations | `AuthGuard.ts`, `auth/types/index.ts`, `GameBoard.ts`, `Gif.ts` |
| **Virtual Identity** | Firebase-to-app user mapping, profile management, display name formatting | `authService.ts`, `userRepository.ts`, `formatDisplayName.ts` |
| **Clean Folder Structure** | Feature-based folders with hooks/components/styles/types separation | Entire `client/features/` directory tree |
