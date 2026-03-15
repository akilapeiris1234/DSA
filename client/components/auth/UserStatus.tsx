// client/components/auth/UserStatus.tsx
// Displays logged-in user info and logout button (Separation of Concerns)
// Gets auth state from useAuth hook, does not call Firebase directly (Low Coupling)
// Pure UI — display name formatting is extracted to formatDisplayName utility (High Cohesion)
// Shows user avatar initial and display name (Virtual Identity)

"use client";

import { DoorOpen } from "lucide-react";
import { useAuth } from "@/client/features/auth/hooks/authHooks";
import { formatDisplayName } from "@/client/features/auth/utils/formatDisplayName";

export default function UserStatus() {
  const { user, logout } = useAuth();

  // Display name logic is extracted to a utility (Separation of Concerns)
  const { initial, shortName } = formatDisplayName(user);

  return (
    <div
      className={
        "flex items-center gap-2 sm:gap-3 " +
        "pl-2.5 pr-2 py-1.5 sm:pl-3 sm:pr-3 sm:py-2 " +
        "bg-white/90 border border-pink-200/80 rounded-full " +
        "shadow-md shadow-pink-300/20 transition-all duration-200 " +
        "hover:shadow-lg hover:shadow-pink-400/30"
      }
    >
      <div
        className="
          w-7 h-7 sm:w-8 sm:h-8 
          rounded-full 
          bg-linear-to-br from-pink-400 to-rose-500 
          flex items-center justify-center 
          text-white font-semibold text-sm sm:text-base
          shadow-sm ring-1 ring-white/60
        "
      >
        {initial}
      </div>

      <span
        className="
          text-sm font-medium text-gray-800 
          hidden sm:block 
          max-width:[140px] truncate
        "
      >
        {shortName}
      </span>

      <button
        onClick={logout}
        disabled={!user}
        className="
          flex items-center justify-center
          w-7 h-7 sm:w-8 sm:h-8
          rounded-full
          bg-rose-100 hover:bg-rose-200
          text-rose-700 hover:text-rose-800
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-rose-400/50
          disabled:opacity-30 disabled:cursor-not-allowed
        "
        title={user ? "Logout" : "Not logged in"}
        aria-label={user ? "Sign out" : "Not logged in"}
      >
        <DoorOpen size={18} />
      </button>
    </div>
  );
}
