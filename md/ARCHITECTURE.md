# 🎯 HeartSweeper Project Architecture

## 1. Introduction

This document outlines the software architecture of the HeartSweeper project. The architecture is designed for clarity, scalability, and maintainability by following clean architecture principles with a clear separation between client, server, and shared code.

---

## 2. Core Principles

-   **Separation of Concerns**: Frontend (`/client`) and backend (`/server`) logic are strictly separated. This makes the codebase easier to navigate and manage.
-   **Layered Architecture**: The application is divided into distinct layers: Presentation (UI), Application (Services), Data Access (Repositories), and Infrastructure.
-   **Low Coupling, High Cohesion**: Code is grouped by feature, and layers communicate through well-defined interfaces (services and events). This reduces dependencies and makes the system more modular.
-   **Event-Driven Communication**: Decoupled components communicate via a central `EventBus`. This is ideal for handling asynchronous operations like authentication without tying the business logic to the UI.

---

## 3. Folder Structure

The project is organized into three main directories: `client`, `server`, and `lib`.

```
heartsweeper/
├── app/                             # Next.js App Router
│   └── api/
│       └── puzzle/
│           └── route.ts             # Example API route
│
├── client/                          # FRONTEND: All client-side code (runs in the browser)
│   ├── features/auth/
│   │   ├── hooks/                   # React hooks for auth features
│   │   │   ├── useAuth.ts           # Manages global auth state
│   │   │   ├── useAuthGuard.ts      # Protects routes from unauthenticated access
│   │   │   ├── useAuthRedirect.ts   # Redirects logged-in users from auth pages
│   │   │   ├── useLoginForm.ts      # Handles state and logic for the login form
│   │   │   └── useSignupForm.ts     # Handles state and logic for the signup form
│   │   └── types/                   # Types specific to the client-side auth feature
│   │       └── index.ts
│   └── lib/
│       └── ui/                      # Reusable, "dumb" UI components
│           ├── ErrorAlert.tsx
│           ├── FormInput.tsx
│           └── LoadingButton.tsx
│
├── lib/                             # SHARED: Isomorphic code (runs on both client & server)
│   ├── core/
│   │   └── events.ts                # Core EventBus for decoupled communication
│   └── data/
│       └── features/auth/
│           ├── services/            # Business logic services
│           │   └── authService.ts   # Orchestrates all authentication logic
│           └── types/               # Shared data types & interfaces for auth
│               └── index.ts
│
├── server/                          # BACKEND: All server-side code (runs in Node.js)
│   ├── lib/
│   │   ├── firebase/
│   │   │   └── firebaseClient.ts    # Firebase SDK wrapper (Singleton pattern)
│   │   ├── repositories/
│   │   │   └── userRepository.ts    # Data access layer for user profiles (Firestore)
│   │   └── utils/
│   │       └── errorHandler.ts      # Maps Firebase errors to user-friendly messages
│
├── md/                              # Project documentation
│   ├── ARCHITECTURE.md              # This file
│   ├── CLIENT_VS_SERVER.md          # Guide on code placement decisions
│   └── IMPLEMENTATION_SUMMARY.md    # Summary of file organization
│
└── next.config.ts                   # Next.js configuration
```

---

## 4. Layers Explained

#### Presentation Layer (`/client`)
-   **Purpose**: Everything the user sees and interacts with in the browser.
-   **Contents**: React Components, React Hooks for local state management (`useState`, `useEffect`), and UI-specific logic.
-   **Key Files**: `client/features/auth/hooks/*.ts`, `client/lib/ui/*.tsx`.
-   **Rule**: This layer should not contain business logic or direct data access. It calls services to perform actions and subscribes to state changes.

#### Application / Service Layer (`/lib/data`)
-   **Purpose**: The core business logic of the application. It orchestrates operations between the UI and the data layer.
-   **Contents**: Service classes that encapsulate business rules and workflows.
-   **Key Files**: `lib/data/features/auth/services/authService.ts`.
-   **Rule**: This is the "brain" of the application. It is decoupled from both the UI framework (React) and the database implementation (Firebase).

#### Data Access Layer (`/server/lib/repositories`)
-   **Purpose**: An abstraction over the database. It handles all Create, Read, Update, and Delete (CRUD) operations.
-   **Contents**: Repository classes that contain database queries.
-   **Key Files**: `server/lib/repositories/userRepository.ts`.
-   **Rule**: This is the only layer that should directly interact with the database. It isolates all database-specific code, making it easy to test or even swap out the database in the future.

#### Infrastructure Layer (`/server/lib/firebase`, `/lib/core`)
-   **Purpose**: Provides implementations for external tools, libraries, and frameworks.
-   **Contents**: Firebase client setup, the eventing system, and other utilities.
-   **Key Files**: `server/lib/firebase/firebaseClient.ts`, `lib/core/events.ts`.

---

## 5. Data Flow (Login Example)

The layers work together in a clear, predictable sequence.

1.  **UI (`client/.../LoginForm.tsx`)**: User enters credentials and clicks "Login".
2.  **Hook (`client/.../useLoginForm.ts`)**: The `handleEmailLogin` function is called. It validates input and sets a `loading` state.
3.  **Service (`lib/.../authService.ts`)**: The hook calls `authService.loginWithEmail()`.
4.  **Infrastructure (`server/.../firebaseClient.ts`)**: The `authService` uses the `firebaseClient` to call Firebase's `signInWithEmailAndPassword`.
5.  **Repository (`server/.../userRepository.ts`)**: After successful authentication, the `authService` calls `userRepository.updateLastActive()` to update the user's profile in Firestore.
6.  **EventBus (`lib/core/events.ts`)**: The `authService` emits a `LOGIN_SUCCESS` event to announce the successful login.
7.  **Hook (`client/.../useAuth.ts`)**: The global `useAuth` hook, subscribed to the `EventBus`, receives the event and updates the application's user state.
8.  **UI (Re-render)**: Components that use `useAuth` automatically re-render to show the logged-in state, and the user is redirected.

---

## 6. Key Concepts & Best Practices

*   **Repository Pattern (`userRepository.ts`)**:
    *   Isolates data access logic from business logic.
    *   Makes it easy to switch databases (e.g., from Firestore to another DB) without changing the `authService`.
    *   Simplifies testing by allowing you to mock the repository.

*   **Service Layer (`authService.ts`)**:
    *   Orchestrates complex operations and keeps business logic out of UI components.
    *   Acts as a clean, testable bridge between the presentation layer and the data layer.

*   **Event-Driven Architecture (`events.ts`)**:
    *   `authService` emits events like `LOGIN_SUCCESS` or `AUTH_ERROR`.
    *   UI hooks (`useAuth`) subscribe to these events to react to state changes.
    *   This decouples the `authService` from the UI. The service doesn't need to know anything about React or its hooks.

*   **Singleton Pattern (`firebaseClient.ts`)**:
    *   The `FirebaseClient.getInstance()` method ensures only one instance of the Firebase client is created and used across the server.
    *   This prevents re-initializing Firebase on every request, which is inefficient and costly.