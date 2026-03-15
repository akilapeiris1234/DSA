// Low Coupling: AuthService calls repository methods, not Firestore directly


import { doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseClient } from "@/lib/firebase/firebaseClient";
import type { UserProfile } from "@/lib/data/features/auth/types/authTypes";

export class UserRepository {
  private firestore = firebaseClient.getFirestore();


  // creates a user profile in Firestore.
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
  // Read a user profile from Firestore. Returns null if not found.
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(this.firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as UserProfile;
  }

  // Update fields on a user profile.
  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(this.firestore, "users", uid);
    await setDoc(docRef, {
      ...data,
      lastActive: new Date().toISOString(),
    }, { merge: true });
  }

  // Update only the lastActive timestamp for a user.
  async updateLastActive(uid: string): Promise<void> {
    const docRef = doc(this.firestore, "users", uid);
    await setDoc(docRef, {
      lastActive: new Date().toISOString(),
    }, { merge: true });
  }
}

export const userRepository = new UserRepository();
