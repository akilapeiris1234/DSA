// client/features/game/components/HeartSweeperGame.tsx
// Game landing page orchestrator — composes GameHero + PlayButton + HowToPlayButton + HowToPlayModal
//
// Concepts:
// - Separation of Concerns: Only handles navigation/event-dispatch + modal state
// - Event-Driven Programming: Emits GAME_STARTED and HOW_TO_PLAY_REQUESTED events
// - Low Coupling: Child components receive onClick callbacks via props
// - Clean Folder Structure: Lives in game feature, uses game-landing components
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventBus } from '@/lib/core/events';
import GameHero from '@/client/features/game-landing/components/GameHero';
import PlayButton from '@/client/features/game-landing/components/PlayButton';
import HowToPlayButton from '@/client/features/game-landing/components/HowToPlayButton';
import HowToPlayModal from '@/client/features/game-landing/components/HowToPlayModal';
import { motion } from 'framer-motion';

export default function HeartSweeperGame() {
  const router = useRouter();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handlePlayClick = async () => {
    eventBus.emit({ type: 'GAME_STARTED' });
    await router.push('/gamepage');
  };

  const handleHowToPlayClick = () => {
    eventBus.emit({ type: 'HOW_TO_PLAY_REQUESTED' });
    setShowHowToPlay(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-gray-950 via-black to-gray-900 text-white">
      {/* Full-screen hero content */}
      <GameHero />
      {/* Buttons fixed at bottom center */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center items-center gap-8 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 md:gap-12"
        >
          <PlayButton onClick={handlePlayClick} />
          <HowToPlayButton onClick={handleHowToPlayClick} />
        </motion.div>
      </div>

      {/* How To Play Modal (Separation of Concerns — modal UI is in its own component) */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
}