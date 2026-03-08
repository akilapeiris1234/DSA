# CLIENT vs SERVER Organization Guide

This document shows the clear separation between client-side and server-side code in the HeartSweeper project.

---

## 🖥️ SIDE-BY-SIDE COMPARISON

### LEFT SIDE: Client (Browser)  |  RIGHT SIDE: Server (Backend)

```
CLIENT SIDE                          SERVER SIDE
═════════════════════════════════════════════════════════════════════

LOGIN PAGE
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│ app/login/page.tsx              │  │ server/api/auth/route.ts     │
│                                 │  │ (To be created)              │
│ Uses: LoginForm component       │  │                              │
└─────────────────────────────────┘  └──────────────────────────────┘
         ↓                                                              
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│ client/components/               │  │ server/lib/repositories/     │
│ auth/LoginForm.tsx              │  │ userRepository.ts            │
│                                 │  │                              │
│ • Renders form UI              │  │ • getProfile(uid)            │
│ • No business logic            │  │ • createProfile(uid, data)   │
│ • Calls useLoginForm hook      │  │ • updateProfile(uid, data)   │
└─────────────────────────────────┘  └──────────────────────────────┘
         ↓                                              ↑              
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│ client/features/auth/            │  │ server/lib/firebase/        │
│ hooks/useLoginForm.ts           │  │ firebaseClient.ts            │
│                                 │  │                              │
│ • Manages form state            │  │ • Initializes Firebase       │
│ • Validates input               │  │ • Provides Auth instance     │
│ • Calls authService.login()    │  │ • Provides Firestore instance│
└─────────────────────────────────┘  └──────────────────────────────┘
         ↓                                              ↑              
┌─────────────────────────────────┐                                   
│ lib/data/features/auth/          │  ┌──────────────────────────────┐
│ services/authService.ts         │  │ lib/core/                    │
│                                 │  │ events.ts                    │
│ • Email validation              │  │                              │
│ • Calls Firebase Auth           │  │ • EventBus emits events     │
│ • Emits EventBus events        │  │ • Decoupled communication   │
└─────────────────────────────────┘  └──────────────────────────────┘
         │                                              ↑              
         └──────────────── HTTP POST /api/auth/login ──┘              


RESPONSE FLOW
═════════════════════════════════════════════════════════════════════

         ← Response with user data
         ↓
┌─────────────────────────────────┐
│ authService receives response    │
│ • Parses JSON                   │
│ • Emits 'auth:login-success'   │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ useAuth hook subscribes to event │
│ • Catches 'auth:login-success'  │
│ • Updates state with user data  │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Component receives new props     │
│ • Re-renders                    │
│ • Shows user name               │
│ • Redirects to /game            │
└─────────────────────────────────┘
```

---

## 📊 SEPARATION OF CONCERNS

| Concern | Client Location | Server Location |
|---------|-----------------|-----------------|
| **UI Rendering** | `client/components/` | ❌ Not in server |
| **Form State** | `client/features/*/hooks/` | ❌ Not in server |
| **Form Validation** | `client/features/*/hooks/` | ❌ Could be in both |
| **Business Logic** | `lib/data/features/*/services/` | ✅ Business layer |
| **Data Access** | ❌ Not in client | `server/lib/repositories/` |
| **Database Queries** | ❌ Not in client | `server/lib/repositories/` |
| **Firebase Auth** | ❌ Not in client | `server/lib/firebase/` |
| **API Endpoints** | ❌ Not in client | `server/api/*/route.ts` |
| **Environment Variables** | `app/` pages | `server/`, `lib/` |
| **Error Handling** | `client/components/` | `server/lib/utils/` |
| **Type Definitions** | `client/features/*/types/` | ❌ Not in server |
| **Domain Models** | `lib/data/features/*/types/` | ✅ Shared |

---

## 🎯 DECISION TREE: Where Should This Code Go?

```
┌─ Is it HTML/JSX markup?
│  ├─ YES → client/components/[feature]/[Component].tsx
│  └─ NO → Continue
│
├─ Is it a React hook (useState, useEffect)?
│  ├─ YES → client/features/[feature]/hooks/use[Hook].ts
│  └─ NO → Continue
│
├─ Is it UI component (Button, Input)?
│  ├─ YES → client/lib/ui/[Component].tsx
│  └─ NO → Continue
│
├─ Is it Firebase SDK code (getAuth(), getFirestore())?
│  ├─ YES → server/lib/firebase/firebaseClient.ts
│  └─ NO → Continue
│
├─ Is it Firestore CRUD (query, setDoc)?
│  ├─ YES → server/lib/repositories/[Repository].ts
│  └─ NO → Continue
│
├─ Is it API route handler?
│  ├─ YES → server/api/[feature]/route.ts
│  └─ NO → Continue
│
├─ Is it business logic (orchestration)?
│  ├─ YES → lib/data/features/[feature]/services/[Service].ts
│  └─ NO → Continue
│
├─ Is it error handling utility?
│  ├─ YES → server/lib/utils/errorHandler.ts
│  └─ NO → Continue
│
└─ Is it infrastructure (EventBus)?
   ├─ YES → lib/core/events.ts
   └─ NO → Ask a question!
```

---

## 🔄 DATA FLOW: Login Example

### What Happens When User Clicks Login

```
STEP 1: User fills form in browser
────────────────────────────────────────────────────────
Location: client/components/auth/LoginForm.tsx
User types: email@example.com, password123


STEP 2: User clicks Submit button
────────────────────────────────────────────────────────
Location: client/components/auth/LoginForm.tsx
Event: handleSubmit() fires


STEP 3: Form validation runs
────────────────────────────────────────────────────────
Location: client/features/auth/hooks/useLoginForm.ts
Check: email format, password length
State: loading = true


STEP 4: Call login service
────────────────────────────────────────────────────────
Location: lib/data/features/auth/services/authService.ts
Action: authService.loginWithEmail(email, password)
Sends: HTTP POST /api/auth/login


STEP 5: NETWORK REQUEST
      ↓↓↓ Request goes to server ↓↓↓
────────────────────────────────────────────────────────
Request body: { email, password }


STEP 6: Server receives request
────────────────────────────────────────────────────────
Location: server/api/auth/route.ts
Handler: async function POST(request)
Body: Parse request JSON


STEP 7: Get Firebase Auth instance
────────────────────────────────────────────────────────
Location: server/lib/firebase/firebaseClient.ts
Action: firebaseClient.getAuth()
Returns: Firebase Auth instance


STEP 8: Call repository to get user
────────────────────────────────────────────────────────
Location: server/lib/repositories/userRepository.ts
Action: userRepository.getProfile(uid)
Query: Query Firestore for user document


STEP 9: Firestore returns data
────────────────────────────────────────────────────────
Database: User profile from Firestore
Data: { uid, email, fullName, photoURL }


STEP 10: Return response to client
────────────────────────────────────────────────────────
Location: server/api/auth/route.ts
Response: JSON { success: true, user: {...} }


STEP 11: NETWORK RESPONSE
      ↑↑↑ Response comes back ↑↑↑
────────────────────────────────────────────────────────


STEP 12: Service receives response
────────────────────────────────────────────────────────
Location: lib/data/features/auth/services/authService.ts
Parse: JSON response with user data
Emit: EventBus.emit('auth:login-success', user)


STEP 13: Hook catches event
────────────────────────────────────────────────────────
Location: client/features/auth/hooks/useAuth.ts
Listen: EventBus.on('auth:login-success', ...)
Update: setUser(user), setLoading(false)


STEP 14: Component receives new props
────────────────────────────────────────────────────────
Location: client/components/auth/LoginForm.tsx
Trigger: Re-render due to hook state change
Display: Success message or redirect to /game


STEP 15: User sees success
────────────────────────────────────────────────────────
Browser: Shows logged in state
Page: Redirects to game page
Done! ✅
```

---

## 🛠️ COMMON PATTERNS

### Pattern 1: Render Data from Database

```
Database
   ↑
   └─ userRepository.getProfile()
      ↑
      └─ (server/lib/repositories/)
         ↑
         └─ authService gets data
            ↑
            └─ (lib/data/features/auth/services/)
               ↑
               └─ EventBus.emit('user:loaded')
                  ↑
                  └─ useAuth hook catches event
                     ↑
                     └─ (client/features/auth/hooks/)
                        ↑
                        └─ UserStatus component re-renders
                           ↑
                           └─ (client/components/auth/)
                              ↓
                           User sees data
```

### Pattern 2: User Form Submission

```
User Input
   ↓
LoginForm component
   ↓
useLoginForm hook
   ↓
authService call
   ↓
HTTP to /api/auth/login
   ↓
API route handler
   ↓
userRepository.getProfile()
   ↓
Firestore query
   ↓
Response back
   ↓
EventBus.emit()
   ↓
useAuth hook state update
   ↓
Component re-renders
   ↓
User sees result
```

### Pattern 3: Protected Route

```
User navigates to /game
         ↓
useAuthGuard hook runs
         ↓
Check: Is user logged in?
         ├─ NO → Redirect to /login
         └─ YES → Allow page render
                  ├─ Can show UserStatus
                  └─ Can access user data
```

---

## 📍 FILE LOCATIONS QUICK LOOKUP

### I need to...

**Add a new UI component:**
```
→ client/components/[feature]/
```

**Add a new input field to a form:**
```
→ client/features/[feature]/hooks/use[Feature]Form.ts
```

**Display reusable UI (button, input, alert):**
```
→ client/lib/ui/
```

**Add business logic for a feature:**
```
→ lib/data/features/[feature]/services/
```

**Add database operations:**
```
→ server/lib/repositories/
```

**Add an API endpoint:**
```
→ server/api/[feature]/route.ts
```

**Handle Firebase SDK:**
```
→ server/lib/firebase/firebaseClient.ts
```

**Map error messages:**
```
→ server/lib/utils/errorHandler.ts
```

**Add core infrastructure:**
```
→ lib/core/
```

---

## 🎓 KEY INSIGHTS

### Why This Structure?

1. **Clear Separation**: You can immediately see what's client vs server
2. **Scalability**: Easy to add new features following the same pattern
3. **Testability**: Mock services and repositories without Firebase
4. **Maintainability**: Related code is organized together
5. **Reusability**: Components, hooks, services can be reused
6. **Type Safety**: Strong typing throughout the stack

### The Flow Principle

```
User Actions in Components
         ↓
State Management via Hooks
         ↓
Business Logic in Services
         ↓
Data Access via Repositories
         ↓
Database (Firebase)
         ↓
Response via EventBus
         ↓
Hook subscribes and updates
         ↓
Component re-renders
         ↓
User sees result
```

This is always the flow. No exceptions.

---

## ✅ Verification Checklist

When organizing code, verify:

- [ ] UI code is in `client/components/`
- [ ] Hooks are in `client/features/*/hooks/`
- [ ] Reusable UI is in `client/lib/ui/`
- [ ] Business logic is in `lib/data/features/*/services/`
- [ ] Database code is in `server/lib/repositories/`
- [ ] Firebase SDK code is ONLY in `server/lib/firebase/`
- [ ] API routes are in `server/api/*/`
- [ ] No circular imports
- [ ] No component directly imports Firebase
- [ ] No component directly calls repository
- [ ] All imports use @ alias for clarity

---

## 📚 See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into architecture
- [client/README.md](./client/README.md) - Client-side guidelines
- [server/README.md](./server/README.md) - Server-side guidelines
- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) - Visual folder layout
