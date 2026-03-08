// client/features/game-landing/components/HowToPlayModal.tsx
// Modal overlay showing game instructions (Separation of Concerns)
// Pure presentational — receives open/close state via props (Low Coupling)
// Reusable modal that accepts any onClose callback (Interoperability)

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Carrot, Bomb, Timer, Trophy, MousePointer } from 'lucide-react';

interface HowToPlayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-5xl pointer-events-auto rounded-3xl bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border border-white/10 shadow-2xl shadow-purple-900/30">

                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-md rounded-t-3xl">
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    📖 How to Play HeartSweeper
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6">

                                {/* Left column */}
                                <div className="space-y-4">
                                    <Section
                                        icon={<Trophy size={20} className="text-yellow-400" />}
                                        title="Goal"
                                        description="Find all the hidden hearts ❤️ and carrots 🥕 on the board without clicking on any bombs 💣!"
                                    />

                                    <Section
                                        icon={<MousePointer size={20} className="text-blue-400" />}
                                        title="How It Works"
                                        description="Each tile hides either a safe item or a bomb. Click a tile to reveal it. The number on a tile tells you how many bombs are nearby."
                                    />

                                    <Section
                                        icon={<Heart size={20} className="text-pink-400" />}
                                        title="Hearts ❤️"
                                        description="Hearts are safe! Collecting them adds to your score. Try to find them all."
                                    />

                                    <Section
                                        icon={<Carrot size={20} className="text-orange-400" />}
                                        title="Carrots 🥕"
                                        description="Carrots are also safe! They count towards your total collected items."
                                    />

                                    <Section
                                        icon={<Bomb size={20} className="text-red-400" />}
                                        title="Bombs 💣"
                                        description="If you click a bomb, the game is over! Use the number clues to avoid them."
                                    />

                                    <Section
                                        icon={<Timer size={20} className="text-green-400" />}
                                        title="Timer ⏱️"
                                        description="Timer starts on first click. Finish faster for a better leaderboard rank!"
                                    />
                                </div>

                                {/* Right column */}
                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                        <h3 className="text-white font-bold text-base mb-3">🎯 Difficulty Levels</h3>
                                        <div className="space-y-2">
                                            <DifficultyRow level="Beginner" grid="5×5" bombs="3" color="text-green-400" />
                                            <DifficultyRow level="Intermediate" grid="6×6" bombs="8" color="text-yellow-400" />
                                            <DifficultyRow level="Expert" grid="8×8" bombs="15" color="text-red-400" />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                        <h3 className="text-white font-bold text-base mb-2">🏆 Leaderboard Ranking</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Players are ranked by <span className="text-pink-400 font-semibold">total items collected</span> (hearts + carrots).
                                            If two players collect the same number, the one with the <span className="text-green-400 font-semibold">faster time</span> ranks higher.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 p-4">
                                        <h3 className="text-white font-bold text-base mb-2">💡 Tips</h3>
                                        <ul className="text-sm text-slate-300 space-y-1.5">
                                            <li>• Start with tiles in the middle — they give more clues</li>
                                            <li>• Use the number on each tile to figure out where bombs are</li>
                                            <li>• Try Beginner first to learn the game</li>
                                            <li>• Your best score per difficulty is saved automatically</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg shadow-pink-900/30"
                                    >
                                        Got it! Let&apos;s Play 🎮
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Sub-components (High Cohesion — only used inside this modal)

function Section({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="mt-0.5 p-2 rounded-xl bg-white/10 shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-0.5">{description}</p>
            </div>
        </div>
    );
}

function DifficultyRow({ level, grid, bombs, color }: { level: string; grid: string; bombs: string; color: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className={`font-semibold ${color}`}>{level}</span>
            <span className="text-slate-400">{grid} grid · {bombs} bombs</span>
        </div>
    );
}
