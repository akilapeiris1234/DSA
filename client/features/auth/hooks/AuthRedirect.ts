/**
 * useAuthRedirect Hook
 * Redirects authenticated users away from login pages
 *
 * Concepts:
 * - High Cohesion: Only handles redirect-if-logged-in logic
 * - Low Coupling: Uses useAuth abstraction, not Firebase directly
 * - Interoperability: Reusable on any page that should redirect logged-in users
 */

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./Auth";

type AuthCheckResult = {
  checking: boolean;
  alreadyLoggedIn: boolean;
};

export function useAuthRedirect(redirectPath = "/GameLanding"): AuthCheckResult {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const alreadyLoggedIn = !!(user && (pathname === "/login" || pathname === "/signup"));

  useEffect(() => {
    if (loading || !alreadyLoggedIn) return;

    const timer = setTimeout(() => {
      router.replace(redirectPath);
    }, 2200);

    return () => clearTimeout(timer);
  }, [user, loading, pathname, router, redirectPath, alreadyLoggedIn]);

  return { checking: loading, alreadyLoggedIn };
}