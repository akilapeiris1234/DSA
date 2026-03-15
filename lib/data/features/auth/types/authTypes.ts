/**
 * Auth Feature Types
 * Centralized type definitions for the auth feature
 *
 * Concepts:
 * - Separation of Concerns: Types are isolated from implementation (no Firebase imports)
 * - Interoperability: These types are shared between hooks, services, and components
 * - High Cohesion: All auth-related types live together in one file
 */

export type AuthCredentials = {
    email: string;
    password: string;
};

export type SignupData = {
    email: string;
    password: string;
    fullName: string;
};

export type UserProfile = {
    uid: string;
    email: string;
    fullName: string;
    photoURL?: string | null;
    createdAt: string;
    lastActive: string;
};

export type AuthUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
};

export type AuthState = {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
};

export type AuthResult = {
    success: boolean;
    message?: string;
    error?: string;
};
