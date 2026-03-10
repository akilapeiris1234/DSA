/**
 * How to Play Button Component
 * Animated button for showing game instructions
 *
 * Concepts:
 * - Separation of Concerns: UI only — receives onClick handler via props
 * - Low Coupling: Does not know what happens on click, just calls the callback
 * - Interoperability: Reusable button that accepts any onClick handler
 */
"use client";

import { motion } from 'framer-motion';

interface HowToPlayButtonProps {
  onClick?: () => void;
}

export default function HowToPlayButton({ onClick }: HowToPlayButtonProps) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full" aria-label="View game instructions" >
      <div className="absolute inset-0 translate-y-1 bg-[#8b5e3c] rounded-full shadow-md"></div>
      <div className="relative px-12 py-4 bg-linear-to-b from-[#fffaf0] to-[#fcf3d7] text-[#5d3a1a] text-xl font-bold rounded-full border-t border-white/50 transition-all duration-200">
        How to Play
      </div>
    </motion.button>
  );
}
