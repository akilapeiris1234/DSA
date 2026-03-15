//low coupling: components call this hook, not Firebase directly

"use client";

import { useEffect, useState, useCallback } from "react";
import { authService } from "@/lib/data/features/auth/services/authService";
import { eventBus } from "@/lib/core/events";
import type { AuthState } from "@/lib/data/features/auth/types/authTypes";


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

    // Subscribe to authentication events
    const unsubscribeError = eventBus.subscribe("AUTH_ERROR", (event) => {
      setState(prev => ({
        ...prev,
        error: event.payload.error,
      }));
    });

    const unsubscribeSignupSuccess = eventBus.subscribe("SIGNUP_SUCCESS", (event) => {
      // Clear error on successful signup
      setState(prev => ({
        ...prev,
        error: null,
      }));
    });

    const unsubscribeLoginSuccess = eventBus.subscribe("LOGIN_SUCCESS", (event) => {
      // Clear error on successful login
      setState(prev => ({
        ...prev,
        error: null,
      }));
    });

    const unsubscribeGoogleLogin = eventBus.subscribe("GOOGLE_LOGIN", (event) => {
      // Clear error on successful Google login
      setState(prev => ({
        ...prev,
        error: null,
      }));
    });

    const unsubscribeProfileCreated = eventBus.subscribe("USER_PROFILE_CREATED", (event) => {
      console.log("User profile created:", event.payload.uid);
    });

    return () => {
      unsubscribe();
      unsubscribeError();
      unsubscribeSignupSuccess();
      unsubscribeLoginSuccess();
      unsubscribeGoogleLogin();
      unsubscribeProfileCreated();
    };
  }, []);

  return { ...state, logout };
}
