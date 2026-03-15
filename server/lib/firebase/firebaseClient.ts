/*
 *
 * Concepts:
 * - Separation of Concerns: All Firebase SDK interaction is isolated here
 * - Low Coupling: Other layers call FirebaseClient methods, not Firebase SDK directly
 * - High Cohesion: All Firebase auth + Firestore setup in one place
 * - Interoperability: Singleton pattern ensures one instance is shared across the app
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  Auth,
  getAuth,
  User,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword as fbCreateUserWithEmail,
  signInWithEmailAndPassword as fbSignInWithEmail,
  signInWithPopup as fbSignInWithPopup,
  updateProfile as fbUpdateProfile,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export class FirebaseClient {
  private static instance: FirebaseClient;
  private auth: Auth;
  private firestore: Firestore;
  private googleProvider: GoogleAuthProvider;

  private constructor() {
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
    this.googleProvider = new GoogleAuthProvider();
  }

  static getInstance(): FirebaseClient {
    if (!FirebaseClient.instance) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  getAuth(): Auth {
    return this.auth;
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getGoogleProvider(): GoogleAuthProvider {
    return this.googleProvider;
  }

  async createUserWithEmail(email: string, password: string): Promise<UserCredential> {
    return fbCreateUserWithEmail(this.auth, email, password);
  }

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return fbSignInWithEmail(this.auth, email, password);
  }

  async signInWithGoogle(): Promise<UserCredential> {
    return fbSignInWithPopup(this.auth, this.googleProvider);
  }

  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error("No authenticated user");
    }
    await fbUpdateProfile(this.auth.currentUser, {
      displayName,
      ...(photoURL && { photoURL }),
    });
  }

  async signOut(): Promise<void> {
    return fbSignOut(this.auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return fbOnAuthStateChanged(this.auth, callback);
  }
}

export const firebaseClient = FirebaseClient.getInstance();

export const db = firebaseClient.getFirestore();
