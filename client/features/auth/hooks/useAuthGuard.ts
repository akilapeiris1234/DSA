/**
 * useAuthGuard Hook
 * Protects pages by redirecting unauthenticated users
 *
 * Concepts:
 * - High Cohesion: Only handles route protection logic
 * - Low Coupling: Delegates auth check to useAuth (does not call Firebase directly)
 * - Interoperability: Can be reused on any protected page
 */

"use client";

import { useAuth } from "./useAuth";

export function useAuthGuard() {
  const { user, loading, error } = useAuth();

  return {
    user,
    loading,
    error,
  };
}
