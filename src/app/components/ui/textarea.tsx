import * as React from "react";
import { cn } from "./utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full resize-y rounded-[16px] border border-[#d8d3cc]/60 bg-[#ffffff] px-4 py-3 text-sm leading-6 text-[#4a3b34] shadow-[inset_0_2px_0_rgba(78,59,49,0.03)] outline-none transition placeholder:text-[#8d827b] focus:border-[#e5c8c4] focus:ring-4 focus:ring-[#f8efee]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
