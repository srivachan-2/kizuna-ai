import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "indigo" | "outline" | "destructive";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-50 text-slate-300 border-border",
    secondary: "bg-slate-800 text-slate-400 border-slate-700",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
    warning: "bg-amber-950/60 text-amber-400 border-amber-800/40",
    indigo: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40",
    outline: "text-slate-300 border-border bg-transparent",
    destructive: "bg-rose-950/60 text-rose-400 border-rose-800/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
