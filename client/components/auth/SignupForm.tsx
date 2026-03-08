// client/components/auth/SignupForm.tsx
// Pure presentational component — renders signup form UI only (Separation of Concerns)
// Receives all state and handlers from useSignupForm hook (Low Coupling)
// Reusable UI primitives imported from client/lib/ui (Interoperability)

"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import { useSignupForm } from "@/client/features/auth/hooks";
import { ErrorAlert, FormInput, LoadingButton } from "@/client/lib/ui";

type Props = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: Props) {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleEmailSignup,
    handleGoogleSignup,
  } = useSignupForm(onSuccess);

  return (
    <form
      className="max-w-[380px] mx-auto w-full flex flex-col gap-5"
      onSubmit={handleEmailSignup}
    >
      <ErrorAlert message={error || ""} />

      <FormInput
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={fullName}
        onChange={setFullName}
        disabled={loading}
        required
      />

      <FormInput
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={setEmail}
        disabled={loading}
        required
      />

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
            className="w-full px-5 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl border-2 border-slate-200 text-base focus:outline-none focus:border-[#eb4d3d] focus:ring-2 focus:ring-[#eb4d3d]/30 transition-all transform focus:translate-x-1 font-medium pr-12 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-60"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="relative py-1 flex items-center">
        <div className="grow border-t-2 border-slate-100" />
        <span className="mx-3 text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
          or sign up with
        </span>
        <div className="grow border-t-2 border-slate-100" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm disabled:opacity-60 ${loading ? "opacity-70 cursor-wait" : ""}`}
      >
        <Image
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        {loading ? "Connecting..." : "Sign up with Google"}
      </button>

      <LoadingButton loading={loading}>Create Account</LoadingButton>

      <p className="text-center text-xs lg:text-sm font-bold text-slate-400 mt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-[#eb4d3d] hover:underline ml-1 font-black">
          Login here
        </Link>
      </p>
    </form>
  );
}
