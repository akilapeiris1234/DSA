/**
 * Form Input Component
 * Pure presentational component for consistent form input styling
 *
 * Concepts:
 * - Separation of Concerns: UI only — receives value and onChange via props
 * - Interoperability: Reused across LoginForm, SignupForm, and any future form
 * - Low Coupling: Does not know what data it handles, just renders an input
 */

"use client";

interface FormInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}

export function FormInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = true,
  icon,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base focus:border-[#eb4d3d] focus:ring-2 focus:ring-[#eb4d3d]/30 transition-all disabled:opacity-60"
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
