// client/components/auth/LoginForm.tsx
// Pure presentational component — renders login form UI only (Separation of Concerns)
// Receives all state and handlers from useLoginForm hook (Low Coupling)
// Reusable UI primitives imported from client/lib/ui (Interoperability)

"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import { useLoginForm } from "@/client/features/auth/hooks";
import { ErrorAlert, FormInput, LoadingButton } from "@/client/lib/ui";

type Props = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleEmailLogin,
    handleGoogleLogin,
  } = useLoginForm(onSuccess);

  return (
    <form className="max-w-[360px] mx-auto w-full flex flex-col gap-5" onSubmit={handleEmailLogin}>
      <ErrorAlert message={error || ""} />

      <FormInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
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
            disabled={loading}
            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base focus:border-[#eb4d3d] focus:ring-2 focus:ring-[#eb4d3d]/30 transition-all pr-12 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="text-right text-sm">
        <Link href="/forgot-password" className="text-[#eb4d3d] hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="relative py-2 flex items-center">
        <div className="flex-grow border-t border-slate-200" />
        <span className="mx-4 text-xs text-slate-400 font-medium">or</span>
        <div className="flex-grow border-t border-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${loading ? "opacity-70 cursor-wait" : ""}`}
      >
        <Image
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        {loading ? "Connecting..." : "Sign in with Google"}
      </button>

      <LoadingButton loading={loading}>Login</LoadingButton>

      <p className="text-center text-sm text-slate-500 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#eb4d3d] font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
