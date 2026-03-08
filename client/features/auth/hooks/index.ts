// client/features/auth/hooks/index.ts
// Barrel exports for auth hooks (Clean Folder Structure)
// Each hook handles one concern (High Cohesion)

export * from "./useAuth";
export * from "./useAuthGuard";
export * from "./useAuthRedirect";
export * from "./useLogoutRedirect";
export * from "./useLoginForm";
export * from "./useSignupForm";