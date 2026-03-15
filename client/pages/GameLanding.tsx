"use client";

import { useAuthGuard, useLogoutRedirect } from "@/client/features/auth/hooks/authHooks";
import UserStatus from "@/client/components/auth/UserStatus";
import HeartSweeperGame from "@/client/features/game/components/HeartSweeperGame";

/**
 * GameLanding Page
 * 
 * Architecture:
 * - useAuthGuard(): Checks if user is authenticated, provides loading state
 * - useLogoutRedirect(): Redirects to login when user logs out
 * - UserStatus: Displays user info and logout button
 * - HeartSweeperGame: Main game landing UI (hero, buttons, animations)
 * 
 * Concerns separated:
 * - Auth logic: Handled by hooks
 * - Game UI: Handled by game component
 * - User profile: Isolated in UserStatus component
 */
export default function GamePage() {
  const { loading } = useAuthGuard();
  useLogoutRedirect();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-300">
        <p className="text-white font-bold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed top-6 right-6 z-100">
        <UserStatus />
      </div>

      {/* Main Game Landing Feature */}
      <main className="w-full h-full">
        <HeartSweeperGame />
      </main>
    </div>
  );
}