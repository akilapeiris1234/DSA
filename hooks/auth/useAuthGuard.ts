//  Protects pages by redirecting unauthenticated users


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
