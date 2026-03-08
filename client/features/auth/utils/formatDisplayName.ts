// client/features/auth/utils/formatDisplayName.ts
// Utility for formatting user display names (Separation of Concerns)
// Business logic extracted from UI — keeps components pure presentational
// Supports Virtual Identity: derives display name from multiple sources

import type { AuthUser } from '@/lib/data/features/auth/types';

/**
 * Formats a display name from AuthUser data
 * Priority: displayName > email prefix > "Guest Player"
 */
export function formatDisplayName(user: AuthUser | null): {
    displayName: string;
    initial: string;
    shortName: string;
} {
    let displayName = 'Player';
    let initial = 'G';

    if (user) {
        displayName = 'Player';

        if (user.displayName) {
            displayName = user.displayName;
        } else if (user.email) {
            const emailPart = user.email.split('@')[0];
            displayName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase();
        }

        initial = displayName.charAt(0).toUpperCase();
    }

    const shortName = displayName.length > 14
        ? displayName.slice(0, 14) + '…'
        : displayName;

    return { displayName, initial, shortName };
}
