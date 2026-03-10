/**
 * Game Hero Component
 * Displays background image and logo with animations
 *
 * Concepts:
 * - Separation of Concerns: UI only — no game logic or auth code
 * - Low Coupling: Gets image paths from gameConfig constants, not hardcoded
 * - High Cohesion: Only responsible for hero section visuals
 */
"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GAME_IMAGES, GAME_ANIMATION } from '@/client/lib/gameConfig';

export default function GameHero() {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <Image src={GAME_IMAGES.background} alt="Game Scene" fill priority className="object-cover" />
      </div>
      <div className="relative z-40 w-full flex justify-center pt-10 md:pt-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: GAME_ANIMATION.logoAnimationDelay }} className="w-full max-w-125 md:max-w-200 px-6" >
          <Image src={GAME_IMAGES.logo} alt="Heart Sweeper" width={1200} height={400} className="w-full h-auto drop-shadow-2xl" priority />
        </motion.div>
      </div>
    </>
  );
}
