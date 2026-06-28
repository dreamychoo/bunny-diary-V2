import * as React from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-[rgba(255,255,255,0.7)] bg-[rgba(255,253,249,0.82)] shadow-[0_6px_20px_rgba(150,105,93,0.08)] backdrop-blur-[18px]",
        className
      )}
      {...props}
    />
  );
}
