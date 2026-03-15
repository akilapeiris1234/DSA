# Low coupling — simple guide and examples

## What "low coupling" means
Low coupling means parts of the code do not depend too much on each other. If you change one part, other parts should not break. This makes the code easier to fix, test, and reuse.

## Why low coupling is useful
- You can change how something works without changing its callers.
- It is easier to write tests by replacing dependencies with mocks.
- Each file or module can focus on one job.


## Files that show low coupling (examples)
- `lib/firebase/firebaseClient.ts` — wraps Firebase SDK in a client class.
- `lib/repositories/userRepository.ts` — handles Firestore reads/writes for user profiles.
- `lib/data/features/auth/services/authService.ts` — runs auth logic and calls repository/client methods.
- `hooks/auth/useAuth.ts` — subscribes to auth changes and gives simple data to components.
- `components/auth/LoginForm.tsx` — renders the login form and uses hooks for actions.
- `hooks/game/useGameBoard.ts` and `hooks/game/useGameTimer.ts` — keep game logic in hooks, not in the UI.
- `lib/errorHandler.ts` — maps error codes to friendly messages in one place.

## Short examples (small snippets)
These show how parts talk to each other without being tightly linked.

### `lib/firebase/firebaseClient.ts`
```ts
export class FirebaseClient {
	getAuth(): Auth { return this.auth }
	getFirestore(): Firestore { return this.firestore }

	async createUserWithEmail(email: string, password: string) {
		return fbCreateUserWithEmail(this.auth, email, password);
	}

	async signInWithGoogle() { return fbSignInWithPopup(this.auth, this.googleProvider); }
}

export const firebaseClient = FirebaseClient.getInstance();
```
Explanation: Wraps Firebase SDK calls so other code uses small methods instead of the SDK directly.

### `lib/repositories/userRepository.ts`
```ts
export class UserRepository {
	private firestore = firebaseClient.getFirestore();

	async createProfile(uid: string, data: Partial<UserProfile>) {
		await setDoc(doc(this.firestore, "users", uid), profile, { merge: true });
	}

	async getProfile(uid: string): Promise<UserProfile | null> { /* returns doc data */ }
}

export const userRepository = new UserRepository();
```
Explanation: Keeps all Firestore reads/writes for user profiles in one place.

### `lib/data/features/auth/services/authService.ts`
```ts
async loginWithEmail(credentials: AuthCredentials) {
	const credential = await firebaseClient.signInWithEmail(credentials.email, credentials.password);
	await userRepository.updateLastActive(credential.user.uid);
	return { success: true };
}

async signupWithEmail(data: SignupData) {
	const credential = await firebaseClient.createUserWithEmail(data.email, data.password);
	await userRepository.createProfile(credential.user.uid, { email: data.email, fullName: data.fullName });
	return { success: true };
}
```
Explanation: Handles auth logic (login/signup) by calling the client and repository; returns simple results.

### `hooks/auth/useAuth.ts`
```ts
useEffect(() => {
	const unsubscribe = authService.subscribeToAuth((user) => {
		setState(prev => ({ ...prev, user, loading: false }));
	});
	return () => unsubscribe();
}, []);
```
Explanation: React hook that listens for auth changes and gives user/loading/error to components.

### `components/auth/LoginForm.tsx` (usage)
```tsx
const { email, setEmail, password, setPassword, handleEmailLogin, handleGoogleLogin } = useLoginForm(onSuccess);
// component only handles presentation and calls hook handlers
```
Explanation: Presentational form that uses hooks for data and actions; it does not handle auth itself.

### `hooks/game/useGameBoard.ts`
```ts
const fetchSolution = useCallback(async () => {
	const res = await fetch(`/api/heart?t=${Date.now()}`);
	const data = await res.json();
	setHeartCount(Number(data.solution));
}, []);

const generateBoard = useCallback(() => { /* builds board from counts */ }, [heartCount, carrotCount]);
```
Explanation: Fetches game data and builds the board; all game rules live here, not in the UI.

### `hooks/game/useGameTimer.ts`
```ts
export function useGameTimer() {
	const startTimer = useCallback(() => { /* starts interval */ }, []);
	const stopTimer = useCallback(() => { /* clears interval */ }, []);
	return { seconds, startTimer, stopTimer, resetTimer };
}
```
Explanation: Small timer hook that starts, stops, and formats elapsed seconds for the game.

### `lib/errorHandler.ts`
```ts
export function mapAuthError(error: unknown): string {
	const errorMap: Record<string,string> = { "auth/invalid-email": "Invalid email format.", /* ... */ };
	return errorMap[(error as any).code] || "An authentication error occurred.";
}
```
Explanation: Converts Firebase error codes into friendly messages shown in the UI.

## Checklist for new code
- Does the UI use a hook or service instead of calling the SDK or DB directly?
- Does the file have one clear job?
- Can you replace the dependency with a mock for tests?

------------------------------------------------------------------------------------------------------------------------


## Examples in this workspace
- `lib/firebase/firebaseClient.ts` — encapsulates Firebase SDK access behind a client (other code calls `firebaseClient`, not SDK directly).
- `lib/repositories/userRepository.ts` — repository class abstracts Firestore operations; services call repository methods instead of raw DB calls.
- `lib/data/features/auth/services/authService.ts` — service layer for authentication; coordinates repositories/clients and maps results for hooks/UI.
- `hooks/auth/useAuth.ts` — custom hook that adapts `authService` for React components, keeping components decoupled from auth internals.
- `components/auth/LoginForm.tsx` — UI-only component that calls hooks for behavior rather than embedding auth logic.
- `hooks/game/useGameBoard.ts` and `hooks/game/useGameTimer.ts` — game logic contained in hooks; game UI components consume hooks.
- `lib/errorHandler.ts` — centralized error mapping isolated from UI/service code.

## How to apply these principles when adding code
- Prefer small service/repository modules that expose a minimal public API.
- Depend on interfaces or single-purpose functions/objects rather than concrete implementations where feasible.
- Keep side effects (network, DB, storage) inside repository or client modules.
- Use hooks to adapt services for React components; keep components presentational.

## Quick checklist for PRs
- Does the UI call a hook/service instead of performing data access directly?
- Is there a single responsibility for the new file/module?
- Can the dependency be mocked or swapped easily for tests?

---


//3.14.2025