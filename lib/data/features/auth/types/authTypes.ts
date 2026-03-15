// Defines data structures  for user identity and access.


export type AuthCredentials = {
    email: string;
    password: string;
};

export type SignupData = {
    email: string;
    password: string;
    fullName: string;
};

export type UserProfile = {
    uid: string;
    email: string;
    fullName: string;
    photoURL?: string | null;
    createdAt: string;
    lastActive: string;
};

export type AuthUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
};

export type AuthState = {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
};

export type AuthResult = {
    success: boolean;
    message?: string;
    error?: string;
};
