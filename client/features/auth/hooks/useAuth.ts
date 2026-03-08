/**
 * useAuth Hook
 * Manages auth state using the event-driven service
 *
 * Concepts:
 * - High Cohesion: Only handles auth state (user, loading, error, logout)
 * - Event-Driven Programming: Subscribes to AUTH_ERROR events via eventBus
 * - Low Coupling: Decoupled from Firebase — only uses AuthService abstraction
 * - Separation of Concerns: Auth logic only, no UI rendering
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { authService } from "@/lib/data/features/auth/services";
import { eventBus } from "@/lib/core/events";
import type { AuthUser, AuthState } from "@/lib/data/features/auth/types";

export function useAuth(): AuthState & { logout: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    user: null,
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

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

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
