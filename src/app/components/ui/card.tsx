import * as React from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "paper-card rounded-[24px] border border-[#d8d3cc]/50 bg-[#ffffff] shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    />
  );
}
