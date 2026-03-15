/**
 * Play Button Component
 * Animated button for starting the game
 *
 * Concepts:
 * - Separation of Concerns: UI only — receives onClick handler via props
 * - Low Coupling: Does not know where navigation goes, just calls the callback
 * - Interoperability: Reusable button that accepts any onClick handler
 */
"use client";

import { motion } from 'framer-motion';

interface PlayButtonProps {
  onClick?: () => void;
}

export default function PlayButton({ onClick }: PlayButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      onClick={onClick}
      className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-full"
      aria-label="Play Game"
    >
      <div className="absolute inset-0 translate-y-2 bg-[#9d1736] rounded-full shadow-lg"></div>
      <div className="relative px-16 py-5 bg-linear-to-b from-[#ff5e7e] to-[#e62e5c] text-white text-3xl font-black rounded-full uppercase italic border-t-2 border-white/40 transition-all duration-200">
        PLAY NOW
      </div>
    </motion.button>
  );
}
