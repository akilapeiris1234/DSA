// client/pages/LoginPage.tsx
// Page-level orchestrator for the login screen (Clean Folder Structure)
// Auth logic is in useAuthRedirect hook, form logic is in useLoginForm hook (Separation of Concerns)
// UI layout only — delegates form rendering to LoginForm component (Low Coupling)

"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/client/components/auth/LoginForm";
import { useAuthRedirect } from "@/client/features/auth/hooks";
import { AUTH_IMAGES } from "@/client/features/auth/constants";

export default function LoginPage() {
  const { checking, alreadyLoggedIn } = useAuthRedirect();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600 animate-pulse flex items-center gap-3">
          <div className="h-6 w-6 border-4 border-t-[#eb4d3d] border-slate-300 rounded-full animate-spin" />
          Checking...
        </div>
      </div>
    );
  }

  // Image path (Separation of Concerns)
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
        <div className="bg-white w-full max-w-5xl rounded-[35px] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          {/* Left decorative panel*/}
          <div
            className="relative hidden lg:flex lg:w-1/2 text-white p-10 flex-col justify-between min-h-175"
            style={{
              clipPath: "polygon(0 0, 100% 0, 88% 100%, 0% 100%)",
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "left center",
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 flex justify-end">
              <div className="flex gap-6 items-center">
                <Link href="/signup" className="text-sm font-bold hover:opacity-80">
                  Sign Up
                </Link>
                <button className="px-6 py-2 border border-white/60 rounded-full text-sm font-bold hover:bg-white/10">
                  Join Us
                </button>
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-6xl font-black mb-4">HeartSweeper</h2>
              <p className="text-lg opacity-90">
                Test your logic, reveal safe hearts, avoid hidden dangers.
              </p>
            </div>
            <div className="h-10" />
          </div>

          {/* Right side*/}
          <div className="w-full lg:w-1/2 px-8 py-10 lg:px-14 flex flex-col justify-between bg-white">
            <div className="h-10" />
            <div className="flex flex-col grow justify-center">
              <div className="text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-2">
                  Welcome
                </h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                  Welcome back
                </p>
              </div>

              <LoginForm />

              {alreadyLoggedIn && (
                <p className="text-center text-green-600 mt-6">
                   logged in scucessfuliiy. Redirecting to game lnading page...
                </p>
              )}
            </div>

            <div className="pt-8 flex justify-center gap-6 text-slate-400">
              <Facebook size={22} />
              <Twitter size={22} />
              <Linkedin size={22} />
              <Instagram size={22} />
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
