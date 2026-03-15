// handle the logout logic

"use client";

import { useEffect } from "react";
import { useAuth } from "./useAuth";


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
