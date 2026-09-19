import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "draft" | "analyzing" | "completed" | "active" | "healthy" | "offline" | "cancelled" | "failed" | string;
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const configs: Record<string, { dot: string; text: string; bg: string }> = {
    draft: {
      dot: "bg-slate-400",
      text: "Draft",
      bg: "bg-slate-900/60 border-slate-800 text-slate-300",
    },
    analyzing: {
      dot: "bg-amber-400 animate-pulse",
      text: "Analyzing",
      bg: "bg-amber-950/40 border-amber-800/40 text-amber-300",
    },
    completed: {
      dot: "bg-emerald-400",
      text: "Completed",
      bg: "bg-emerald-950/40 border-emerald-800/40 text-emerald-300",
    },
    active: {
      dot: "bg-indigo-400",
      text: "Active",
      bg: "bg-indigo-950/40 border-indigo-800/40 text-indigo-300",
    },
    healthy: {
      dot: "bg-emerald-400",
      text: "System Ready",
      bg: "bg-emerald-950/40 border-emerald-800/40 text-emerald-300",
    },
    offline: {
      dot: "bg-rose-400",
      text: "Offline",
      bg: "bg-rose-950/40 border-rose-800/40 text-rose-300",
    },
    cancelled: {
      dot: "bg-amber-500",
      text: "Cancelled",
      bg: "bg-amber-950/40 border-amber-800/40 text-amber-300",
    },
    failed: {
      dot: "bg-rose-500",
      text: "Failed",
      bg: "bg-rose-950/40 border-rose-800/40 text-rose-300",
    },
  };

  const config = configs[status] || configs.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.bg,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {label || config.text}
    </span>
  );
}
