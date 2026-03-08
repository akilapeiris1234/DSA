// client/pages/SignupPage.tsx
// Page-level orchestrator for the signup screen (Clean Folder Structure)
// Auth logic is in useAuthRedirect hook, form logic is in useSignupForm hook (Separation of Concerns)
// UI layout only — delegates form rendering to SignupForm component (Low Coupling)

"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignupForm from "@/client/components/auth/SignupForm";
import { useAuthRedirect } from "@/client/features/auth/hooks";
import { AUTH_IMAGES } from "@/client/features/auth/constants";

export default function SignupPage() {
  const { checking } = useAuthRedirect(); // redirects automatically if logged in

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-slate-600 animate-pulse flex items-center gap-3">
          <div className="h-6 w-6 border-4 border-t-[#eb4d3d] border-slate-300 rounded-full animate-spin" />
          Please wait...
        </div>
      </div>
    );
  }

  // Image path from centralized config (Separation of Concerns)
  const bgImage = AUTH_IMAGES.background;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col font-sans"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/25 lg:bg-black/0 pointer-events-none z-0 lg:hidden" />
      <div
        className="absolute inset-0 bg-white transition-all duration-700 hidden lg:block z-0"
        style={{ clipPath: "polygon(65% 0, 100% 0, 100% 100%, 55% 100%)" }}
      />

      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="grow relative z-10 flex flex-col items-center px-4 py-16 lg:py-24">
        <div className="bg-white w-full max-w-5xl rounded-[35px] shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-transform duration-500 ease-out hover:scale-[1.005]">
          {/* Left Panel – almost identical to login but adjusted text */}
          <div
            className="relative hidden lg:flex lg:w-1/2 text-white p-10 flex-col justify-between overflow-hidden lg:min-h-175"
            style={{
              clipPath: "polygon(0 0, 100% 0, 88% 100%, 0% 100%)",
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "left center",
            }}
          >
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <div className="relative z-10 flex justify-end items-center">
              <div className="flex gap-6 items-center">
                <Link
                  href="/login"
                  className="text-sm font-bold hover:opacity-70 transition-transform"
                >
                  Login
                </Link>
                <button className="px-6 py-2 border border-white/60 rounded-full text-sm font-bold hover:bg-white/10 transition-all transform hover:scale-105">
                  Join Us
                </button>
              </div>
            </div>
            <div className="relative z-10 flex flex-col justify-center">
              <h2 className="text-5xl lg:text-6xl font-black mb-4 tracking-tighter drop-shadow-xl">
                HeartSweeper
              </h2>
              <p className="text-base lg:text-lg font-medium leading-relaxed opacity-95 max-w-[90%]">
                Welcome to HeartSweeper — test your logic, reveal safe hearts, and avoid hidden dangers.
              </p>
            </div>
            <div className="relative z-10 h-10" />
          </div>

          {/* Right side – now clean */}
          <div className="w-full lg:w-1/2 px-8 py-10 lg:px-14 flex flex-col justify-between bg-white">
            <div className="h-6 lg:h-10" />

            <div className="flex flex-col grow justify-center py-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                  Create Account
                </h1>
                <p className="text-slate-500 font-bold text-xs lg:text-sm uppercase tracking-widest">
                  Start your journey today
                </p>
              </div>

              <SignupForm />
            </div>

            <div className="pt-8 flex justify-center gap-8 text-slate-400">
              <button className="hover:text-[#eb4d3d] transition-transform hover:scale-125">
                <Facebook size={22} fill="currentColor" />
              </button>
              <button className="hover:text-[#eb4d3d] transition-transform hover:scale-125">
                <Twitter size={22} fill="currentColor" />
              </button>
              <button className="hover:text-[#eb4d3d] transition-transform hover:scale-125">
                <Linkedin size={22} fill="currentColor" />
              </button>
              <button className="hover:text-[#eb4d3d] transition-transform hover:scale-125">
                <Instagram size={22} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>

      {/* Shake animation is now in globals.css (Separation of Concerns) */}
    </div>
  );
}
