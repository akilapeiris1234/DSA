
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventBus } from '@/lib/core/events';
import GameHero from '@/components/game-landing/GameHero';
import PlayButton from '@/components/game-landing/PlayButton';
import HowToPlayButton from '@/components/game-landing/HowToPlayButton';
import HowToPlayModal from '@/components/game-landing/HowToPlayModal';
import { motion } from 'framer-motion';

export default function HeartSweeperGame() {
  const router = useRouter();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handlePlayClick = async () => {
    eventBus.emit({ type: 'GAME_STARTED' });
    await router.push('/game');
  };

  const handleHowToPlayClick = () => {
    eventBus.emit({ type: 'HOW_TO_PLAY_REQUESTED' });
    setShowHowToPlay(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-gray-950 via-black to-gray-900 text-white">
      <GameHero />

      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center items-center gap-8 px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="flex flex-col sm:flex-row gap-6 md:gap-12" >
          <PlayButton onClick={handlePlayClick} />
          <HowToPlayButton onClick={handleHowToPlayClick} />
        </motion.div>
      </div>
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
}