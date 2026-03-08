# HeartSweeper — Game Navigation Guide

This document explains how users move through the app and which code files handle each step.

---

## File Structure (Navigation Files Only)

```
heartsweeper/
│
├── app/
│   ├── page.tsx                                ← ① Home route entry
│   ├── login/
│   │   └── page.tsx                            ← ② Login route entry
│   ├── GameLanding/
│   │   └── page.tsx                            ← ⑤ Auth guard + game landing
│   └── gamepage/
│       └── page.tsx                            ← ⑦ Game page orchestrator
│
├── client/
│   ├── pages/
│   │   ├── HomePage.tsx                        ← ② "Start Playing" → /login
│   │   └── LoginPage.tsx                       ← ④ Login layout + auth redirect
│   │
│   └── features/
│       ├── auth/hooks/
│       │   ├── useAuthRedirect.ts              ← ③ Redirect to /GameLanding after login
│       │   ├── useAuthGuard.ts                 ← ⑤ Block unauthenticated users
│       │   └── useLogoutRedirect.ts            ← ⑨ Redirect to /login on logout
│       │
│       └── game/components/
│           ├── HeartSweeperGame.tsx             ← ⑥ "Play Now" → /gamepage
│           └── GameNav.tsx                      ← ⑧ Play Game / Leaderboard tabs
```

> Numbers ①–⑨ show the navigation order.

---

## Navigation Flow

```
┌──────────┐     ┌──────────┐     ┌───────────────┐     ┌────────────┐
│  Home    │────▶│  Login   │────▶│ Game Landing  │────▶│ Game Page  │
│  /       │     │  /login  │     │ /GameLanding  │     │ /gamepage  │
└──────────┘     └──────────┘     └───────────────┘     └────────────┘
  "Start           Auth              "Play Now"          Play Game /
  Playing"         Success           button              Leaderboard
                                                         tabs
                     ▲                                        │
                     │              Logout                    │
                     └────────────────────────────────────────┘
```

---

## Step-by-Step Code Files

---

### Step 1: Home Page → Login

**Route file:** `app/page.tsx`
```tsx
// Thin entry point — delegates to the client page
import HomePage from "@/client/pages/HomePage";
export default HomePage;
```

**Page file:** `client/pages/HomePage.tsx`
```tsx
// The "Start Playing" button navigates to /login
<Link href="/login">
  <motion.button>
    <Lock size={20} />
    Start Playing
    <ArrowRight size={20} />
  </motion.button>
</Link>
```

---

### Step 2: Login Page

**Route file:** `app/login/page.tsx`
```tsx
// Thin entry point — delegates to the client page
import LoginPage from "@/client/pages/LoginPage";
export default LoginPage;
```

**Page file:** `client/pages/LoginPage.tsx`
```tsx
// Uses useAuthRedirect to check if user is already logged in
const { checking, alreadyLoggedIn } = useAuthRedirect();

// Delegates form rendering to LoginForm component (Separation of Concerns)
<LoginForm />
```

**Auth redirect hook:** `client/features/auth/hooks/useAuthRedirect.ts`
```tsx
// If user is already logged in → redirect to /GameLanding
// This runs automatically when the page loads
useEffect(() => {
  if (user) {
    router.push('/GameLanding');
  }
}, [user]);
```

---

### Step 3: Game Landing Page

**Route file:** `app/GameLanding/page.tsx`
```tsx
// Auth guard checks if user is logged in
const { user, loading } = useAuthGuard();

// Logout redirect watches for logout event
useLogoutRedirect();

// User status shows avatar + logout button (top-right)
<UserStatus />

// Main game landing UI
<HeartSweeperGame />
```

**Auth guard hook:** `client/features/auth/hooks/useAuthGuard.ts`
```tsx
// Protects the page — only allows authenticated users
// Returns user and loading state
const { user, loading } = useAuth();
return { user, loading };
```

---

### Step 4: Play Now → Game Page

**Game landing component:** `client/features/game/components/HeartSweeperGame.tsx`
```tsx
// When "Play Now" is clicked:
const handlePlayClick = async () => {
  // 1. Emit event (Event-Driven Programming)
  eventBus.emit({ type: 'GAME_STARTED' });
  // 2. Navigate to game page
  await router.push('/gamepage');
};

// Render buttons
<PlayButton onClick={handlePlayClick} />
<HowToPlayButton onClick={handleHowToPlayClick} />
```

---

### Step 5: Game Page (Play Game + Leaderboard)

**Route file:** `app/gamepage/page.tsx`
```tsx
// Tab switching between Play Game and Leaderboard
const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play');

// Navigation tabs
<GameNav activeTab={activeTab} onTabChange={setActiveTab} />

// Show different content based on active tab
{activeTab === 'play' ? (
  // Game grid, stats, difficulty selector
) : (
  // Leaderboard view
)}
```

**Tab navigation component:** `client/features/game/components/GameNav.tsx`
```tsx
// Two tabs: "Play Game" and "Leaderboard"
// Switches view without changing the URL
<button onClick={() => onTabChange('play')}>Play Game</button>
<button onClick={() => onTabChange('leaderboard')}>Leaderboard</button>
```

---

### Step 6: Logout → Back to Login

**Logout redirect hook:** `client/features/auth/hooks/useLogoutRedirect.ts`
```tsx
// Listens for auth state change
// When user becomes null (logged out) → redirect to /login
useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading]);
```

---

## Summary Table

| Navigation Step | Trigger | Code File | Concept Used |
|---|---|---|---|
| Home → Login | "Start Playing" button | `HomePage.tsx` | Low Coupling (Link component) |
| Login → Game Landing | Successful auth | `useAuthRedirect.ts` | Event-Driven (auth state change) |
| Guest blocked | No auth token | `useAuthGuard.ts` | Separation of Concerns |
| Game Landing → Game | "Play Now" button | `HeartSweeperGame.tsx` | Event-Driven (`GAME_STARTED`) |
| Play ↔ Leaderboard | Tab click | `GameNav.tsx` | High Cohesion (tab logic only) |
| Logout → Login | Logout button | `useLogoutRedirect.ts` | Event-Driven (auth state change) |

---

## All 9 Navigation Files

| # | File | Purpose |
|---|---|---|
| 1 | `app/page.tsx` | Home route entry |
| 2 | `client/pages/HomePage.tsx` | "Start Playing" → `/login` |
| 3 | `client/features/auth/hooks/useAuthRedirect.ts` | Auto-redirect after login |
| 4 | `client/pages/LoginPage.tsx` | Login page layout |
| 5 | `app/GameLanding/page.tsx` | Auth guard + game landing |
| 6 | `client/features/game/components/HeartSweeperGame.tsx` | "Play Now" → `/gamepage` |
| 7 | `app/gamepage/page.tsx` | Game page orchestrator |
| 8 | `client/features/game/components/GameNav.tsx` | Play / Leaderboard tabs |
| 9 | `client/features/auth/hooks/useLogoutRedirect.ts` | Logout → `/login` |
