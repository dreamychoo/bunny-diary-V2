import * as React from "react";
import { cn } from "./utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[16px] border border-[rgba(217,205,197,0.5)] bg-[rgba(255,255,255,0.8)] px-4 text-sm font-medium text-[var(--ink)] shadow-[inset_0_2px_0_rgba(78,59,49,0.03)] outline-none transition placeholder:text-[#8d827b] focus:border-[var(--pink)] focus:ring-4 focus:ring-[var(--pink-soft)]",
        className
      )}
      {...props}
    />
  );
}
