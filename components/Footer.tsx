"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/60 backdrop-blur-md mt-auto">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-600 p-2 shadow-md">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                Heart<span className="text-rose-400">Sweeper</span>
              </h3>
            </div>
            <p className="text-sm text-rose-100/60 max-w-sm leading-relaxed">
              A modern distributed logic game powered by real-time architecture and secure data handling.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <h4 className="text-sm font-black text-rose-400 tracking-widest uppercase">
              Technologies Used
            </h4>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-rose-100/70">
              <span>Next.js 14</span>
              <span>Tailwind CSS</span>
              <span>Firebase</span>
              <span>Heart API</span>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start md:items-end gap-4">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500/80 mb-1">
                Academic Project
              </p>
              <h4 className="text-lg lg:text-xl font-bold text-white leading-tight">
                Distributed Service Architectures
              </h4>
              <p className="mt-1 text-sm text-rose-100/50 italic">
                UOB • Class of 2026
              </p>
            </div>

            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-rose-100/40">
              <Link href="/login" className="group flex items-center gap-2 hover:text-rose-400 transition-colors">
                Play Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="cursor-default">v1.0.5</span>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-rose-200/30">
          <p>© {new Date().getFullYear()} Akila. Academic Submission.</p>
          <div className="flex gap-6">
            <span className="hover:text-rose-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-rose-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}