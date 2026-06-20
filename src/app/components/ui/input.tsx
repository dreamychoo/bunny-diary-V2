import * as React from "react";
import { cn } from "./utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[16px] border border-[#d8d3cc]/60 bg-[#ffffff] px-4 text-sm font-medium text-[#4a3b34] shadow-[inset_0_2px_0_rgba(78,59,49,0.03)] outline-none transition placeholder:text-[#8d827b] focus:border-[#e5c8c4] focus:ring-4 focus:ring-[#f8efee]",
        className
      )}
      {...props}
    />
  );
}
