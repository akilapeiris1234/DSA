"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Lock } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 border-b border-white/9 bg-black/45 backdrop-blur-xl backdrop-saturate-[1.15]"
    >
      <div className="mx-auto h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 max-w-screen-2xl">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-2.5 shadow-lg shadow-rose-900/40 transition group-hover:scale-105">
            <Heart size={20} fill="white" className="text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Heart<span className="text-rose-300">Sweeper</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
          <Link
            href="/"
            className="hidden sm:block text-sm font-medium text-rose-100/85 hover:text-white transition-colors">
            Home
          </Link>

          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-fuchsia-700 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold shadow-lg shadow-fuchsia-950/40 hover:shadow-fuchsia-900/50 transition-all">
              <Lock size={16} />
              Enter Game
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}