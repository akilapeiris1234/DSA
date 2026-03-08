/**
 * Error Alert Component
 * Pure presentational component for displaying error messages
 *
 * Concepts:
 * - Separation of Concerns: UI only — receives message string via props
 * - Interoperability: Used by LoginForm, SignupForm, and any future form
 * - Low Coupling: Does not know where the error came from
 */

"use client";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="text-red-600 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-200 animate-shake">
      {message}
    </div>
  );
}
