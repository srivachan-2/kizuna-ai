import * as React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  subtitle,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("hover:border-slate-700/80 transition-all", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-2xl font-bold tracking-tight text-slate-100">{value}</p>
          {change && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                changeType === "positive" && "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
                changeType === "negative" && "text-rose-400 bg-rose-950/40 border-rose-800/30",
                changeType === "neutral" && "text-slate-400 bg-slate-800/40 border-slate-700/30"
              )}
            >
              {change}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
