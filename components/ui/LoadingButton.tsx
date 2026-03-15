

"use client";

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function LoadingButton({
  loading,
  children,
  type = "submit",
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className="w-full px-5 py-4 bg-[#eb4d3d] text-white font-bold rounded-2xl hover:bg-[#d93d2d] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
