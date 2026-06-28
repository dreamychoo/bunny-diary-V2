import * as React from "react";
import { cn } from "./utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full resize-y rounded-[16px] border border-[rgba(217,205,197,0.5)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-sm leading-6 text-[var(--ink)] shadow-[inset_0_2px_0_rgba(78,59,49,0.03)] outline-none transition placeholder:text-[#8d827b] focus:border-[var(--pink)] focus:ring-4 focus:ring-[var(--pink-soft)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
