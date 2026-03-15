/**
 * Game Landing Configuration
 * Centralized constants for game landing page images, routes, and animation settings
 *
 * Concepts:
 * - Separation of Concerns: Config values separated from component logic
 * - High Cohesion: All game-landing-related settings grouped together
 * - Interoperability: Shared across GameHero, PlayButton, HeartSweeperGame
 */

export const GAME_IMAGES = {
  background: '/images/gamelanding.png',
  logo: '/images/logo.png',
} as const;

export const GAME_ROUTES = {
  gameLanding: '/GameLanding',
  game: '/gamepage',
  instructions: '#instructions',
  login: '/login',
} as const;

export const GAME_ANIMATION = {
  logoAnimationDelay: 0.2,
  buttonsAnimationDelay: 0.5,
  buttonAnimationDuration: 0.8,
} as const;
