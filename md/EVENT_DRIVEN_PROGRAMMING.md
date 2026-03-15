# Event-Driven Programming — simple guide and examples

## What "Event-Driven Programming" means

Event-Driven Programming is when your code reacts to events—things that happen in the app—like a user clicking a button, finishing a game, or getting an error. Instead of parts of the code calling each other directly, they send signals (events) through a central event bus. Other parts listen for those events and react.

**Simple analogy:** Think of a notification board at a company. When the payroll team has news, they post it on the board. Any employee interested in payroll news reads the board. The payroll team doesn't need to call every employee directly.

## Why it is useful

- **Loose coupling:** Parts of the app don't need to know about each other. The game board doesn't import the leaderboard.
- **Easy to extend:** Add new reaction to an event without changing the event emitter.
- **Clear communication:** All events are in one place, so you can see what signals flow through the app.
- **Asynchronous:** Events let different parts react at different times.

## The Event Bus

The event system uses a central `EventBus`. Think of it as a post office:
- **Emit:** Send a signal/event (like a letter in the mail).
- **Subscribe:** Listen for a signal/event (like checking your mailbox).
- **Unsubscribe:** Stop listening (like asking to remove yourself from a mailing list).

### `lib/core/events.ts` — The Central Event Bus
```ts
// Define all the events your app can send
export type AuthEvent =
  | { type: 'LOGIN_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'SIGNUP_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'USER_PROFILE_CREATED'; payload: { uid: string } }
  | { type: 'GOOGLE_LOGIN'; payload: { uid: string; isNewUser: boolean } };

export type GameEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_OVER'; payload: { won: boolean; hearts: number; carrots: number; time: number } }
  | { type: 'SCORE_SAVED'; payload: { uid: string; difficulty: string } };

// The EventBus class that handles emit and subscribe
class EventBus {
  // Subscribe to an event: listen for it and run a callback when it fires
  subscribe<T extends AppEvent['type']>(eventType: T, listener: EventListener<...>): () => void {
    // ... add listener to map ...
    return () => { /* unsubscribe */ }; // Return unsubscribe function
  }

  // Emit an event: send a signal through the bus
  emit<T extends AppEvent>(event: T): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event)); // Call all listeners
    }
  }
}

export const eventBus = new EventBus();
```

**Explanation:** This creates a pub/sub (publish-subscribe) system. Any hook, service, or component can emit events and subscribe to them. The EventBus keeps track of who is listening and calls them when the event fires.

---

## Example 1: Auth Service Emits Events

When a user logs in, the service sends signals that other parts can react to.

### `lib/data/features/auth/services/authService.ts` — Emitter
```ts
export class AuthService {
  // Log in with email and password
  async loginWithEmail(credentials: AuthCredentials) {
    try {
      // Call Firebase
      const credential = await firebaseClient.signInWithEmail(
        credentials.email, credentials.password
      );
      
      // Update last active
      await userRepository.updateLastActive(credential.user.uid);

      // 📤 EMIT: Send a signal that login succeeded
      eventBus.emit({
        type: "LOGIN_SUCCESS",
        payload: { uid: credential.user.uid, email: credential.user.email || "" },
      });

      return { success: true };
    } catch (error) {
      // 📤 EMIT: Send a signal that auth failed
      eventBus.emit({
        type: "AUTH_ERROR",
        payload: { error: mapAuthError(error) },
      });
      return { success: false, error: mapAuthError(error) };
    }
  }

  async signupWithEmail(data: SignupData) {
    try {
      // ... create user ...
      
      // 📤 EMIT: User profile created
      eventBus.emit({
        type: "SIGNUP_SUCCESS",
        payload: { uid: user.uid, email: user.email || "" },
      });
      eventBus.emit({
        type: "USER_PROFILE_CREATED",
        payload: { uid: user.uid },
      });
      return { success: true };
    } catch (error) {
      // 📤 EMIT: Send error
      eventBus.emit({
        type: "AUTH_ERROR",
        payload: { error: mapAuthError(error) },
      });
      return { success: false, error: mapAuthError(error) };
    }
  }

  async logout() {
    try {
      await firebaseClient.signOut();
      // 📤 EMIT: User logged out
      eventBus.emit({ type: "LOGOUT" });
      return { success: true };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  }
}
```

**Explanation:** The auth service does not import or call any UI code. It just emits events. If someone needs to know that the user logged in, they listen for `LOGIN_SUCCESS`.

---

## Example 2: useAuth Hook Listens to Events

The auth hook listens for `AUTH_ERROR` events and updates the app error state.

### `hooks/auth/useAuth.ts` — Listener
```ts
export function useAuth(): AuthState & { logout: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribeToAuth((user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    // 📥 LISTEN: Subscribe to AUTH_ERROR event
    const unsubscribeError = eventBus.subscribe("AUTH_ERROR", (event) => {
      // When AUTH_ERROR fires, update error state
      setState(prev => ({
        ...prev,
        error: event.payload.error,
      }));
    });

    // Clean up listeners when hook unmounts
    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, []);

  return { ...state, logout };
}
```

**Explanation:** The hook listens for `AUTH_ERROR`. When the event fires (e.g., wrong password), the hook updates state. The component using this hook gets the error automatically.

---

## Example 3: Game Board Emits Game Over Event

When the game ends, the board emits an event so other parts (leaderboard, GIF controller) can react.

### `hooks/game/useGameBoard.ts` — Emitter
```ts
export function useGameBoard({ difficulty, onTimerStart, onTimerStop, onTimerReset, seconds }) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [foundHearts, setFoundHearts] = useState(0);
  const [foundCarrots, setFoundCarrots] = useState(0);

  // Handle tile click
  const handleReveal = useCallback((r: number, c: number) => {
    // ... game logic ...
    
    if (cell.content === 'bomb') {
      setIsGameOver(true);
      onTimerStop();
      // Game lost
      return;
    }

    if (currentHearts === heartCount && currentCarrots === carrotCount) {
      setIsGameOver(true);
      setGameWon(true);
      onTimerStop();
      // Game won
    }
  }, [...]);

  // When game ends, emit event
  useEffect(() => {
    if (isGameOver) {
      // 📤 EMIT: Game is over, tell everyone
      eventBus.emit({
        type: 'GAME_OVER',
        payload: { 
          won: gameWon, 
          hearts: foundHearts, 
          carrots: foundCarrots, 
          time: seconds 
        },
      });
    }
  }, [isGameOver, gameWon, foundHearts, foundCarrots, seconds]);

  return { board, handleReveal, isGameOver, gameWon, ... };
}
```

**Explanation:** The game board doesn't care who reacts to game over. It just emits the event. The leaderboard, GIF fetcher, or any other hook can listen and react independently.

---

## Example 4: Leaderboard Listens to Game Over

The leaderboard hook listens for the `GAME_OVER` event and saves the score.

### `hooks/game/useLeaderboard.ts` — Listener
```ts
export function useLeaderboard({ user, difficulty, isGameOver, gameWon, foundHearts, foundCarrots, seconds }) {
  const [scoreSaved, setScoreSaved] = useState(false);

  // Save score when game ends
  useEffect(() => {
    const saveScore = async () => {
      if (isGameOver && !scoreSaved) {
        if (foundHearts === 0 && foundCarrots === 0) return;
        
        setScoreSaved(true);
        try {
          const db = getFirestore(getApp());
          const uid = user?.uid || 'guest';
          const displayName = user?.displayName || 'Guest Player';
          const newTotal = foundHearts + foundCarrots;

          // Check for existing record
          const existingQuery = query(
            collection(db, 'leaderboard'),
            where('uid', '==', uid),
            where('difficulty', '==', difficulty)
          );
          const existingDocs = await getDocs(existingQuery);

          if (!existingDocs.empty) {
            // Update existing record if this score is better
            const existingDoc = existingDocs.docs[0];
            const isBetter = newTotal > existingTotal || 
                           (newTotal === existingTotal && seconds < existingData.time);
            if (isBetter) {
              await updateDoc(doc(db, 'leaderboard', existingDoc.id), {
                hearts: foundHearts,
                carrots: foundCarrots,
                time: seconds,
                timestamp: serverTimestamp(),
              });
            }
          } else {
            // Create new leaderboard entry
            await addDoc(collection(db, 'leaderboard'), {
              uid,
              displayName,
              difficulty,
              hearts: foundHearts,
              carrots: foundCarrots,
              time: seconds,
              timestamp: serverTimestamp(),
            });
          }

          // 📤 EMIT: Score saved
          eventBus.emit({
            type: 'SCORE_SAVED',
            payload: { uid, difficulty },
          });
        } catch (error) {
          console.error('Failed to save score:', error);
        }
      }
    };

    saveScore();
  }, [isGameOver, scoreSaved, foundHearts, foundCarrots, seconds, user, difficulty]);

  return { /* ... */ };
}
```

**Explanation:** The leaderboard listens for when the game ends and saves the score to Firestore. It doesn't need to import the game board hook. It just waits for the `GAME_OVER` event.

---

## Event Flow Diagram

```
User clicks "Play"
    ↓
Game Board Hook (useGameBoard)
    ↓
User clicks tiles...
    ↓
User finds all items or hits bomb
    ↓
🔴 GAME_OVER event emitted
    ├─→ "Leaderboard Hook" listens and saves score
    ├─→ "GIF Hook" listens and fetches celebration GIF
    └─→ "Page" listens and shows Game Over panel

User logs in
    ↓
Auth Service (authService)
    ↓
🔴 LOGIN_SUCCESS event emitted
    └─→ "useAuth Hook" listens and updates user state
    
Auth error occurs
    ↓
Auth Service
    ↓
🔴 AUTH_ERROR event emitted
    └─→ "useAuth Hook" listens and shows error message
```

---

## Benefits of Event-Driven Architecture

| Benefit | Example |
|---|---|
| **Loose Coupling** | Game board doesn't import leaderboard. They communicate via events. |
| **Easy to extend** | Add a new feature (e.g., analytics) that listens to GAME_OVER. No changes to game board. |
| **Clear communication** | All events are defined in one file (`lib/core/events.ts`). Easy to see what signals flow through the app. |
| **Multiple listeners** | Many hooks can listen to the same event (game over → leaderboard, GIF, analytics). |
| **Easy to test** | Mock `eventBus.emit()` and check that the right code runs. |

---

## Checklist for new code

- Are related parts sending signals instead of calling each other directly?
- Are all events defined in one place (`lib/core/events.ts`)?
- Can you subscribe/unsubscribe without importing the emitter?
- Do event names describe what happened (past tense: `GAME_OVER`, `LOGIN_SUCCESS`)?
- Are listeners cleaned up to avoid memory leaks (return unsubscribe in useEffect)?

---

## User Interactions — Button Clicks & Input Changes

UI events (button clicks, input changes) are the **starting point**. They trigger functions that emit application-level events.

### Button Click & Input Change Example — `components/auth/LoginForm.tsx`
```tsx
interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleEmailLogin,
    handleGoogleLogin,
  } = useLoginForm(onSuccess);

  return (
    <form onSubmit={handleEmailLogin}>
      {/* Email input — onChange updates state */}
      <FormInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}  {/* ← Input change event */}
      />

      {/* Password input — onChange updates state */}
      <input
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}  {/* ← Input change event */}
      />

      {/* Email login button — form submit */}
      <LoadingButton loading={loading}>Login</LoadingButton>
      {/* ↑ Submit button triggers handleEmailLogin on form submit */}

      {/* Google login button — onClick */}
      <button
        type="button"
        onClick={handleGoogleLogin}  {/* ← Button click event */}
      >
        Sign in with Google
      </button>
    </form>
  );
}
```

**Event flow:**
1. User types email → `onChange` fires → `setEmail()` updates state
2. User types password → `onChange` fires → `setPassword()` updates state
3. User clicks "Login" → `onSubmit` fires → `handleEmailLogin()` from hook
4. Hook calls `authService.loginWithEmail(...)`
5. Service calls Firebase and emits `LOGIN_SUCCESS` or `AUTH_ERROR` event
6. Other hooks listen and react

---

### Game Board Tile Click Example — `components/game/GameGrid.tsx`
```tsx
interface GameGridProps {
    board: Cell[][];
    gridSize: number;
    tileSize: number;
    onReveal: (r: number, c: number) => void;
}

export default function GameGrid({ board, gridSize, tileSize, onReveal }: GameGridProps) {
    return (
        <div id="grid" className="grid">
            {board.map((row, ri) =>
                row.map((cell, ci) => (
                    <div
                        key={`${ri}-${ci}`}
                        className={`tile ${cell.revealed ? 'revealed' : ''}`}
                        onClick={() => onReveal(ri, ci)}  {/* ← Tile click event */}
                        style={{ width: tileSize, height: tileSize }}
                    >
                        {content}
                    </div>
                ))
            )}
        </div>
    );
}
```

**Event flow:**
1. User clicks a tile → `onClick` fires → calls `onReveal(row, col)`
2. `onReveal` is `handleReveal` from `useGameBoard` hook
3. Hook updates board state and checks for bombs, win, or loss
4. If game ends → hook emits `GAME_OVER` event
5. Leaderboard hook listens and saves score to Firestore
6. GIF hook listens and fetches celebration GIF

---

## Complete Event Flow: UI → Logic → Application Events

```
┌─── UI Layer (Components) ───────┐
│ • Button click (onClick)         │
│ • Input change (onChange)        │
│ • Form submit (onSubmit)         │
│ Fires React/DOM event           │
└────────────────┬────────────────┘
                 ↓
┌─── Logic Layer (Hooks) ─────────┐
│ Hook function runs              │
│  • handleLogin()                │
│  • handleReveal()               │
│  • handleSignup()               │
└────────────────┬────────────────┘
                 ↓
┌─ Data Layer (Services) ─────────┐
│ Service calls Firebase/API      │
│  • authService.loginWithEmail()│
│  • userRepository.createProfile()
└────────────────┬────────────────┘
                 ↓
📤 EMIT Application Event
  (LOGIN_SUCCESS, GAME_OVER,
   AUTH_ERROR, SCORE_SAVED)
                 ↓
📥 LISTEN: Other hooks react
  • Update state (user, leaderboard)
  • Redirect to another page
  • Save data
  • Show messages or animations
```

**Key points:**
- **DOM/React events** (click, change, submit) are handled by components via onClick, onChange, onSubmit.
- **Application events** (via `eventBus.emit()`) are custom signals for loose coupling between hooks and services.
- Components → Hooks → Services → `eventBus` → Other Hooks/Components listen.

---

If you want, I can create additional files explaining High Cohesion, Interoperability, or Virtual Identity.
