/**
 * Data access layer for user profile CRUD operations
 * Concepts:
 * - Separation of Concerns: Only handles Firestore reads/writes for user profiles
 * - Low Coupling: AuthService calls repository methods, not Firestore directly
 * - High Cohesion: All user profile operations (create, get, update) in one class
 * - Virtual Identity: Manages user profiles (display name, photo, activity tracking)
 */

import { doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseClient } from "../firebase/firebaseClient";
import type { UserProfile } from "@/lib/data/features/auth/types";

export class UserRepository {
  private firestore = firebaseClient.getFirestore();

  async createProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const profile: UserProfile = {
      uid,
      email: data.email || "",
      fullName: data.fullName || "Player",
      photoURL: data.photoURL || null,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await setDoc(doc(this.firestore, "users", uid), profile, { merge: true });
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(this.firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as UserProfile;
  }

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(this.firestore, "users", uid);
    await setDoc(docRef, {
      ...data,
      lastActive: new Date().toISOString(),
    }, { merge: true });
  }

  async updateLastActive(uid: string): Promise<void> {
    const docRef = doc(this.firestore, "users", uid);
    await setDoc(docRef, {
      lastActive: new Date().toISOString(),
    }, { merge: true });
  }
}

export const userRepository = new UserRepository();
