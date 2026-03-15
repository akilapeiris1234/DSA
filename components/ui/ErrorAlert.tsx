//UI only — receives message string via props



"use client";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="text-red-600 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-200 animate-shake">
      {message}
    </div>
  );
}
