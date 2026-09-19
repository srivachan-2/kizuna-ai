import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
    };

    const variantStyles = {
      primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-sm hover:shadow-indigo-500/20 active:translate-y-px",
      secondary: "bg-surface-50 hover:bg-surface-100 text-slate-200 border border-border",
      outline: "border border-border hover:bg-surface-100 text-slate-300 hover:text-white",
      ghost: "text-slate-400 hover:text-slate-200 hover:bg-surface-100/50",
      danger: "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
