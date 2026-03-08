/**
 * useLoginForm Hook
 * Business logic for login form — handles submission and state
 *
 * Concepts:
 * - High Cohesion: Only handles login form state and submission logic
 * - Separation of Concerns: Logic only, no UI rendering (UI is in LoginForm.tsx)
 * - Low Coupling: Uses authService abstraction, not Firebase directly
 */

"use client";

import { useState } from "react";
import { authService } from "@/lib/data/features/auth/services";
import type { AuthCredentials } from "@/lib/data/features/auth/types";

export function useLoginForm(onSuccess?: () => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const credentials: AuthCredentials = {
      email: email.trim(),
      password,
    };

    const result = await authService.loginWithEmail(credentials);

    if (!result.success) {
      setError(result.error || "Login failed");
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const result = await authService.signInWithGoogle();

    if (!result.success) {
      setError(result.error || "Google login failed");
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    showPassword,
    setShowPassword,
    handleEmailLogin,
    handleGoogleLogin,
  };
}
