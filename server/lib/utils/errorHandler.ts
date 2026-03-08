/**
 * Error Handling Utility
 * Concepts:
 * - Separation of Concerns: Error mapping logic isolated from service/UI code
 * - High Cohesion: All auth error messages are defined in one place
 * - Interoperability: Can be used by any service that handles Firebase errors
 */

import { FirebaseError } from "firebase/app";

export function mapAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }

  const errorMap: Record<string, string> = {
    "auth/invalid-email": "Invalid email format.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/email-already-in-use": "This email is already in use. Please log in instead.",
    "auth/weak-password": "Password is too weak (minimum 6 characters).",
    "auth/operation-not-allowed": "Email/password sign-up is not enabled.",
    "auth/popup-closed-by-user": "Failed to sign in. Please try again.",
    "auth/popup-blocked": "Popup was blocked. Please allow popups for this site.",
    "auth/cancelled-popup-request": "Failed to sign in. Please try again.",
    "auth/account-exists-with-different-credential": "Account exists with different sign-in method.",
  };

  return errorMap[error.code] || error.message || "An authentication error occurred.";
}
