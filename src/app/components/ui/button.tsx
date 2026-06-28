import * as React from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "garden" | "ghost" | "danger";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border border-[rgba(255,111,134,0.3)] bg-gradient-to-b from-[var(--pink-2)] to-[var(--pink)] text-white shadow-[0_8px_20px_rgba(255,111,134,0.30)]",
  secondary: "border border-[rgba(255,111,134,0.3)] bg-[var(--pink-soft)] text-[var(--pink)] hover:bg-[#ffe5e8]",
  garden: "border border-[rgba(120,147,111,0.5)] bg-[#78936f] text-white shadow-[0_2px_12px_rgba(75,58,52,0.06)] hover:bg-[#6d8765]",
  ghost: "border border-transparent bg-transparent text-[var(--ink)] hover:border-[rgba(255,111,134,0.2)] hover:bg-white/72",
  danger: "border border-[#934e4e] bg-[#b45f5f] text-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:bg-[#9d4f4f]"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5c8c4] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
