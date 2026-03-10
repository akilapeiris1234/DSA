/**
 * useLogoutRedirect Hook
 * Handles redirect to login when user logs out
 * Separation of Concerns: Navigation logic separate from UI
 * Event-driven: Listens to auth state changes
 */

"use client";

import { useEffect } from "react";
import { useAuth } from "./Auth";


export function useLogoutRedirect(redirectPath = "/login"): void {
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) {
      const timer = setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, redirectPath]);
}
