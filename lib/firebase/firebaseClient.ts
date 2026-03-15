
// call FirebaseClient methods, not Firebase SDK directly.

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

  // Return the Firebase Auth object for use by other modules.
  getAuth(): Auth {
    return this.auth;
  }

  // Return the Firestore object for database access.
  getFirestore(): Firestore {
    return this.firestore;
  }

  // Return the Google provider used for Google sign-in.
  getGoogleProvider(): GoogleAuthProvider {
    return this.googleProvider;
  }

  // // Creates user in Firebase Authentication
  async createUserWithEmail(email: string, password: string): Promise<UserCredential> {
    return fbCreateUserWithEmail(this.auth, email, password);
  }

  // Sign in an existing user with email and password.
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return fbSignInWithEmail(this.auth, email, password);
  }


  async signInWithGoogle(): Promise<UserCredential> {
    return fbSignInWithPopup(this.auth, this.googleProvider);
  }

  // Update the current user display name and optional photo URL.
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