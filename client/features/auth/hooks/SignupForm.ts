/**
 * useSignupForm Hook
 * Business logic for signup form — handles submission and state
 *
 * Concepts:
 * - High Cohesion: Only handles signup form state and submission logic
 * - Separation of Concerns: Logic only, no UI rendering (UI is in SignupForm.tsx)
 * - Low Coupling: Uses authService abstraction, not Firebase directly
 */

"use client";

import { useState } from "react";
import { authService } from "@/lib/data/features/auth/services/authService";
import type { SignupData } from "@/lib/data/features/auth/types/authTypes";

export function useSignupForm(onSuccess?: () => void) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const signupData: SignupData = {
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    };

    const result = await authService.signupWithEmail(signupData);

    if (!result.success) {
      setError(result.error || "Signup failed");
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    const result = await authService.signInWithGoogle();

    if (!result.success) {
      setError(result.error || "Google signup failed");
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    showPassword,
    setShowPassword,
    handleEmailSignup,
    handleGoogleSignup,
  };
}
