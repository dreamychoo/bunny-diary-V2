import * as React from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "garden" | "ghost" | "danger";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border border-[#d7b6b1] bg-[#e5c8c4] text-[#4a3b34] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-[#ecd5d2]",
  secondary: "border border-[#9fb6cc] bg-[#eef5fb] text-[#4a3b34] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-[#e2eef8]",
  garden: "border border-[#78936f] bg-[#78936f] text-white shadow-[0_2px_12px_rgba(75,58,52,0.06)] hover:bg-[#6d8765]",
  ghost: "border border-transparent bg-transparent text-[#4a3b34] hover:border-[#d6c9bc] hover:bg-[#ffffff]/72",
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
