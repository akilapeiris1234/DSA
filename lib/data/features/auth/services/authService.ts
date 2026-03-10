/**
 * Auth Service
 * Business logic for authentication — orchestrates auth operations and emits events
 *
 * Concepts:
 * - Separation of Concerns: Service layer between UI hooks and Firebase (data access)
 * - Event-Driven Programming: Emits LOGIN_SUCCESS, SIGNUP_SUCCESS, AUTH_ERROR, LOGOUT events
 * - Low Coupling: Hooks call authService, not Firebase directly
 * - High Cohesion: All auth operations (login, signup, Google, logout) in one service
 * - Virtual Identity: Maps Firebase User to app-level AuthUser type
 */

import { getAdditionalUserInfo, User } from "firebase/auth";
import { firebaseClient } from "@/server/lib/firebase/firebaseClient";
import { userRepository } from "@/server/lib/repositories/userRepository";
import { mapAuthError } from "@/server/lib/utils/errorHandler";
import { eventBus } from "@/lib/core/events";
import type {
  AuthCredentials,
  SignupData,
  AuthUser,
  AuthResult
} from "@/lib/data/features/auth/types/authTypes";

export class AuthService {
  /**
   * Login with email and password
   */
  async loginWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const credential = await firebaseClient.signInWithEmail(
        credentials.email,
        credentials.password
      );

      const user = credential.user;
      await userRepository.updateLastActive(user.uid);

      eventBus.emit({
        type: "LOGIN_SUCCESS",
        payload: { uid: user.uid, email: user.email || "" },
      });

      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      eventBus.emit({
        type: "AUTH_ERROR",
        payload: { error: message },
      });
      return { success: false, error: message };
    }
  }

  /**
   * Signup with email and password
   */
  async signupWithEmail(data: SignupData): Promise<AuthResult> {
    try {
      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const credential = await firebaseClient.createUserWithEmail(
        data.email,
        data.password
      );
      const user = credential.user;

      // Update display name
      if (data.fullName) {
        await firebaseClient.updateUserProfile(data.fullName);
      }

      // Create user profile in Firestore
      await userRepository.createProfile(user.uid, {
        email: data.email,
        fullName: data.fullName,
      });

      eventBus.emit({
        type: "SIGNUP_SUCCESS",
        payload: { uid: user.uid, email: user.email || "" },
      });
      eventBus.emit({
        type: "USER_PROFILE_CREATED",
        payload: { uid: user.uid },
      });

      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      eventBus.emit({
        type: "AUTH_ERROR",
        payload: { error: message },
      });
      return { success: false, error: message };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const credential = await firebaseClient.signInWithGoogle();
      const user = credential.user;
      const additionalInfo = getAdditionalUserInfo(credential);
      const isNewUser = additionalInfo?.isNewUser ?? false;

      // Create profile for new users
      if (isNewUser) {
        await userRepository.createProfile(user.uid, {
          email: user.email || "",
          fullName: user.displayName || "Player",
          photoURL: user.photoURL,
        });

        eventBus.emit({
          type: "USER_PROFILE_CREATED",
          payload: { uid: user.uid },
        });
      } else {
        await userRepository.updateLastActive(user.uid);
      }

      eventBus.emit({
        type: "GOOGLE_LOGIN",
        payload: { uid: user.uid, isNewUser },
      });

      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      eventBus.emit({
        type: "AUTH_ERROR",
        payload: { error: message },
      });
      return { success: false, error: message };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<AuthResult> {
    try {
      await firebaseClient.signOut();
      eventBus.emit({ type: "LOGOUT" });
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      return { success: false, error: message };
    }
  }

  /**
   * Convert Firebase user to app user type
   */
  mapFirebaseUser(firebaseUser: User | null): AuthUser | null {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
    return firebaseClient.onAuthStateChanged((firebaseUser: User | null) => {
      const user = this.mapFirebaseUser(firebaseUser);
      callback(user);
    });
  }
}

export const authService = new AuthService();
