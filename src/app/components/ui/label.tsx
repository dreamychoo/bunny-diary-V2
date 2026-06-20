import * as React from "react";
import { cn } from "./utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-bold text-[#4a3b34]", className)} {...props} />;
}
