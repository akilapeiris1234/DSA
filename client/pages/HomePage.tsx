// client/pages/HomePage.tsx
// Public landing page — no auth or game logic (Separation of Concerns)
// Uses shared Navbar/Footer components (Interoperability, Low Coupling)

"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AUTH_IMAGES } from "@/client/features/auth/constants";

export default function HomePage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.25 },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.95, ease: [0.21, 0.98, 0.36, 1] },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-white overflow-x-hidden selection:bg-rose-500/20">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={AUTH_IMAGES.homeBackground}
          alt="HeartSweeper Background"
          fill
          priority
          className="object-cover brightness-[0.82]"
        />
        <div className="absolute inset-0 bg-linear-to-br from-purple-950/68 via-indigo-950/45 to-rose-950/35" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      <Navbar />
      <main className="grow flex items-center justify-center pt-20 pb-24 md:pt-28 lg:pt-32 px-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[110%] h-[140%] bg-rose-600/8 blur-3xl -z-10 rounded-full" />

            <motion.div variants={fadeInUp} className="flex justify-center mb-8 md:mb-10">
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-black tracking-tighter leading-none mb-6 md:mb-8"
            >
              <span className="text-white">HEART</span>
              <span className="block bg-linear-to-r from-rose-300 via-fuchsia-300 to-rose-400 bg-clip-text text-transparent animate-gradient-x bg-size-[200%_auto]">
                SWEEPER
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl lg:max-w-3xl text-lg md:text-xl lg:text-2xl text-rose-50/85 font-medium leading-relaxed mb-10 md:mb-14"
            >
              A real-time distributed logic puzzle.<br className="hidden sm:block" />
              Every heart hides a secret-uncover them without triggering the mines.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-linear-to-r from-rose-600 to-fuchsia-700 px-8 py-5 md:px-12 md:py-7 text-lg md:text-2xl font-bold shadow-2xl shadow-rose-950/50 transition-all hover:shadow-rose-900/70"
                >
                  <Lock size={20} className="md:size-6" />
                  Start Playing
                  <ArrowRight size={20} className="md:size-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
