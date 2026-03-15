# Virtual Identity — Simple Guide and Examples

## What "Virtual Identity" Means

Virtual identity is the **digital representation of a user** inside your app. It includes information like username, email, user ID, profile picture, and other data that describes "who the user is" in the system.

**Simple analogy:** A virtual identity is like a digital passport. Just as a real passport has your name, photo, and ID number, a virtual identity has your username, email, unique ID, and profile details.

## Why It's Useful

- **Identify users:** Know who is logged in and whose data you're looking at.
- **Personalize the experience:** Greet users by name, show their scores, remember their preferences.
- **Tie data to users:** Track scores, achievements, and settings per user.
- **Keep things secure:** Use unique IDs (like `uid`) instead of user names to protect privacy.
- **Connect across the app:** Login on one page, see your name everywhere—all through virtual identity.

## Example 1: User Always Has a Virtual Identity

Every signed-in user has a virtual identity stored in Firebase. This identity is used throughout the app.

## The Journey of a Virtual Identity

```
User signs up with email + password
    ↓
Firebase creates unique ID (uid)
    ↓
User profile is created with uid, email, fullName, photoURL
    ↓
This profile is stored in Firestore
    ↓
Anywhere the user goes, the app looks them up by uid
    ↓
User sees their name, avatar, scores — all from virtual identity
```

## The Code

### Step 1: Authentication Creates Virtual Identity — `lib/data/features/auth/services/authService.ts`

```ts
// Sign up a new user with email and password.
async signupWithEmail(data: SignupData): Promise<AuthResult> {
    try {
        if (data.password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        // Firebase creates a new user and assigns a unique ID (uid)
        const credential = await firebaseClient.createUserWithEmail(
            data.email,
            data.password
        );
        const user = credential.user;

        // Update the user profile with display name
        if (data.fullName) {
            await firebaseClient.updateUserProfile(data.fullName);
        }

        // Create a user profile record in Firestore (virtual identity details)
        await userRepository.createProfile(user.uid, {
            email: data.email,
            fullName: data.fullName,
        });

        // Emit events to tell the app a new user was created
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
        const message = mapAuthError(error);
        eventBus.emit({
            type: "AUTH_ERROR",
            payload: { error: message },
        });
        return { success: false, error: message };
    }
}
```

**Explanation:** When a user signs up, Firebase assigns a unique `uid` (user ID). This ID becomes the **virtual identity**. The app stores the user's email, name, and photo associated with this ID.

### Step 2: Profile Stores Virtual Identity Details — `lib/repositories/userRepository.ts`

```ts
// Keeps database code in one place so other code does not use Firestore directly.
async createProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    // Create a complete profile record with the user's virtual identity details
    const profile: UserProfile = {
        uid,  // ← The virtual identity (unique user ID from Firebase)
        email: data.email || "",
        fullName: data.fullName || "Player",  // ← User's display name
        photoURL: data.photoURL || null,  // ← User's profile picture
        createdAt: new Date().toISOString(),  // ← When account was created
        lastActive: new Date().toISOString(),  // ← When user last played
    };

    // Save this profile to Firestore database
    await setDoc(doc(this.firestore, "users", uid), profile, { merge: true });
}

// Read a user profile from Firestore (look up by virtual identity uid)
async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(this.firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;  // ← No user with this virtual identity
    }

    return docSnap.data() as UserProfile;  // ← Return the virtual identity details
}
```

**Explanation:** The `uid` is the **virtual identity key**. All user data (email, name, photo) is stored together under this ID. Any time the app needs to find a user, it looks them up by this `uid`.

### Step 3: Hook Provides Virtual Identity to Components — `hooks/auth/useAuth.ts`

```ts
// Components call this hook to get auth data without talking to Firebase directly.
export function useAuth(): AuthState & { logout: () => Promise<void> } {
  // Store the current user's virtual identity in state
  const [state, setState] = useState<AuthState>({
    user: null,  // ← Will hold the virtual identity (uid, email, name)
    loading: true,
    error: null,
  });

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await authService.logout();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
    }
  }, []);

  // Subscribe to auth changes and auth error events when the hook mounts.
  useEffect(() => {
    // Listen for when the user logs in (virtual identity changes)
    const unsubscribe = authService.subscribeToAuth((user) => {
      setState(prev => ({
        ...prev,
        user,  // ← The virtual identity (uid, email, etc.)
        loading: false,
      }));
    });

    // Listen for auth errors and save them in state.
    const unsubscribeError = eventBus.subscribe("AUTH_ERROR", (event) => {
      setState(prev => ({
        ...prev,
        error: event.payload.error,
      }));
    });

    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, []);

  return { ...state, logout };
}
```

**Explanation:** This hook **provides the user's virtual identity** to any component that uses it. Components can now know "who is logged in" and see their details.

### Step 4: Component Displays Virtual Identity — `components/auth/UserStatus.tsx`

```tsx
// Displays logged-in user info and logout button
// Gets auth state from useAuth hook, does not call Firebase directly (Low Coupling)
// Pure UI — display name formatting is extracted to formatDisplayName utility (High Cohesion)
// Shows user avatar initial and display name (Virtual Identity)

"use client";

import { DoorOpen } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatDisplayName } from "@/lib/auth/formatDisplayName";

export default function UserStatus() {
  // Get the virtual identity from the hook
  const { user, logout } = useAuth();

  // Format the user's virtual identity data for display
  const { initial, shortName } = formatDisplayName(user);

  return (
    <div
      className={
        "flex items-center gap-2 sm:gap-3 " +
        "pl-2.5 pr-2 py-1.5 sm:pl-3 sm:pr-3 sm:py-2 " +
        "bg-white/90 border border-pink-200/80 rounded-full " +
        "shadow-md shadow-pink-300/20 transition-all duration-200 " +
        "hover:shadow-lg hover:shadow-pink-400/30"
      }
    >
      {/* Avatar: Show first letter of user's name (from virtual identity) */}
      <div
        className="
          w-7 h-7 sm:w-8 sm:h-8 
          rounded-full 
          bg-linear-to-br from-pink-400 to-rose-500 
          flex items-center justify-center 
          text-white font-semibold text-sm sm:text-base
          shadow-sm ring-1 ring-white/60
        "
      >
        {initial}  {/* ← First letter of user's virtual identity name */}
      </div>

      {/* Display Name: Show user's virtual identity name */}
      <span
        className="
          text-sm font-medium text-gray-800 
          hidden sm:block 
          max-width:[140px] truncate
        "
      >
        {shortName}  {/* ← User's virtual identity name from hook */}
      </span>

      {/* Logout Button: Only show if user has virtual identity (is logged in) */}
      <button
        onClick={logout}
        disabled={!user}  {/* ← Disable if no virtual identity */}
        className="
          flex items-center justify-center
          w-7 h-7 sm:w-8 sm:h-8
          rounded-full
          bg-rose-100 hover:bg-rose-200
          text-rose-700 hover:text-rose-800
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-rose-400/50
          disabled:opacity-30 disabled:cursor-not-allowed
        "
        title={user ? "Logout" : "Not logged in"}
        aria-label={user ? "Sign out" : "Not logged in"}
      >
        <DoorOpen size={18} />
      </button>
    </div>
  );
}
```

**Explanation:** The component gets the user's virtual identity from the hook and displays it — the avatar initial and name. When the user is not logged in (no virtual identity), the logout button is disabled.

**Benefits:**
- ✓ User's identity follows them everywhere in the app.
- ✓ Safe: Uses unique `uid`, not the password.
- ✓ Personalized: App knows who you are and shows your name.
- ✓ Connected: Scores, achievements, and settings are tied to your virtual identity.

---

## Example 2: Virtual Identity Ties Scores to Players

The leaderboard saves game scores and ties each score to a user's virtual identity.

## How It Works

```
User wins the game
    ↓
Game knows the user's virtual identity (uid, name)
    ↓
App saves the score with the user's uid
    ↓
Leaderboard shows scores tied to virtual identities
    ↓
User sees "John: 100 points" (John's virtual identity + score)
```

## The Code

### Leaderboard Uses Virtual Identity — `hooks/game/useLeaderboard.ts`

```ts
// Save score on game over (with duplicate prevention)
useEffect(() => {
    const saveScore = async () => {
        if (isGameOver && !scoreSaved) {
            if (foundHearts === 0 && foundCarrots === 0) return;
            setScoreSaved(true);
            try {
                const db = getFirestore(getApp());
                
                // Get the user's virtual identity (or use 'guest' if not logged in)
                const uid = user?.uid || 'guest';
                // Get the user's virtual identity display name
                const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest Player';
                
                // Calculate the score from found items
                const newTotal = foundHearts + foundCarrots;

                // Check if this user (virtual identity) already has a score for this difficulty
                const existingQuery = query(
                    collection(db, 'leaderboard'),
                    where('uid', '==', uid),  // ← Look up by virtual identity uid
                    where('difficulty', '==', difficulty)
                );
                const existingDocs = await getDocs(existingQuery);

                if (!existingDocs.empty) {
                    // User (virtual identity) already has a score — check if new score is better
                    const existingDoc = existingDocs.docs[0];
                    const existingData = existingDoc.data();
                    const existingTotal = (existingData.hearts || 0) + (existingData.carrots || 0);

                    const isBetter =
                        newTotal > existingTotal ||
                        (newTotal === existingTotal && seconds < (existingData.time || Infinity));

                    if (isBetter) {
                        // Update the score for this user's virtual identity
                        await updateDoc(doc(db, 'leaderboard', existingDoc.id), {
                            displayName,  // ← User's virtual identity name
                            hearts: foundHearts,
                            carrots: foundCarrots,
                            time: seconds,
                            result: gameWon ? 'win' : 'loss',
                            timestamp: serverTimestamp(),
                        });
                    }
                } else {
                    // First time this user's virtual identity has played this difficulty
                    await addDoc(collection(db, 'leaderboard'), {
                        uid,  // ← Virtual identity key
                        displayName,  // ← Virtual identity name
                        difficulty,
                        hearts: foundHearts,
                        carrots: foundCarrots,
                        time: seconds,
                        result: gameWon ? 'win' : 'loss',
                        timestamp: serverTimestamp(),
                    });
                }
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }
    };

    saveScore();
}, [isGameOver, scoreSaved, user, difficulty, foundHearts, foundCarrots, seconds, gameWon]);
```

**Explanation:** When the game ends, the app saves the score **tied to the user's virtual identity** (`uid`). The leaderboard looks up users by their virtual identity and shows scores associated with each one. If the same user plays again, the leaderboard finds their virtual identity and updates only their best score.

**Benefits:**
- ✓ Scores belong to the right person (virtual identity).
- ✓ Leaderboard shows who got which score (virtual identity name + score).
- ✓ Multiple plays: Same player (virtual identity) can beat their own score.
- ✓ Privacy: No one sees the password—only the virtual identity name.

---

## The Three Layers of Virtual Identity

| Layer | What It Does | Example |
|---|---|---|
| **Authentication** | Creates the virtual identity (unique `uid`) | Firebase creates `uid: "abc123xyz"` when you sign up |
| **Profile** | Stores details about the virtual identity | Store `uid, email, fullName, photoURL` in database |
| **Usage** | Uses the virtual identity to track data | Save game scores tied to `uid` in leaderboard |

---

## Data Flow: From Sign-Up to Leaderboard

```
1. Sign Up (Auth Layer)
   User enters: email + password
        ↓
   Firebase creates: uid (virtual identity key)

2. Profile Creation (Data Layer)
   uid + email + fullName + photoURL → stored in database

3. Auth Hook (Logic Layer)
   Hook watches for login/logout
   Provides virtual identity to components

4. Component Display (UI Layer)
   Component shows: avatar + name (from virtual identity)

5. Leaderboard (Features Layer)
   Game saves score tied to: uid (virtual identity)
   Leaderboard queries by: uid
   User sees: "John: 100 points" (name from virtual identity + score)
```

---

## Virtual Identity Objects

Inside the app, a user's virtual identity looks like this:

```ts
// AuthUser: The basic virtual identity from Firebase
interface AuthUser {
    uid: string;           // ← The unique virtual identity key
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}

// UserProfile: Extended virtual identity with extra details
interface UserProfile {
    uid: string;           // ← Virtual identity key
    email: string;
    fullName: string;      // ← Virtual identity name
    photoURL: string | null;
    createdAt: string;
    lastActive: string;
}

// LeaderboardEntry: Virtual identity linked to score
interface LeaderboardEntry {
    uid: string;           // ← Virtual identity key
    displayName: string;   // ← Virtual identity name
    hearts: number;        // ← Score data
    carrots: number;       // ← Score data
    time: number;
    difficulty: Difficulty;
    result: 'win' | 'loss';
    timestamp: Timestamp;
}
```

---

## Checklist for Virtual Identity

When building user features:

- ✓ Does the user have a unique ID (`uid`)? → Use it to identify them everywhere.
- ✓ Do you need to remember user details? → Store them tied to the `uid`.
- ✓ Do you show the user's name? → Use the virtual identity name from profile.
- ✓ Do you save user data (scores, settings)? → Always tie it to the `uid`.
- ✓ Can users stay anonymous? → Use a "guest" or "anonymous" virtual identity.

---

## Summary

Virtual identity is the **digital representation of each user** in your app. It starts with a unique ID (`uid`) from authentication, grows with profile details (name, email, photo), and is used to tie all user data together (scores, settings, achievements). By using virtual identity, your app knows who is logged in and can personalize the experience for each user.