"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Settings,
  FileText,
  Compass,
  Radar,
  Users,
  ShieldAlert,
  CalendarDays,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { getAnalysisResults } from "@/lib/api";
import { AnalysisRunResponse, AnalysisStage } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "New Analysis",
    href: "/analysis/new",
    icon: PlusCircle,
    badge: "Create",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface PipelineStageItem {
  id: AnalysisStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeStatusMsg: string;
}

const PIPELINE_STAGES: PipelineStageItem[] = [
  { id: "brief", label: "Product Intelligence", icon: FileText, activeStatusMsg: "Extracting brief..." },
  { id: "market_lens", label: "Market Intelligence", icon: Compass, activeStatusMsg: "Evaluating market fit..." },
  { id: "competitor_map", label: "Competitor Intelligence", icon: Radar, activeStatusMsg: "Analyzing landscape..." },
  { id: "partner_match", label: "Partner Matching", icon: Users, activeStatusMsg: "Evaluating partner fit..." },
  { id: "red_team", label: "Risk & Red Team", icon: ShieldAlert, activeStatusMsg: "Stress-testing risks..." },
  { id: "launch_plan", label: "90-Day Launch Plan", icon: CalendarDays, activeStatusMsg: "Synthesizing roadmap..." },
  { id: "executive_brief", label: "Executive Brief", icon: FileDown, activeStatusMsg: "Preparing brief..." },
];

export function Sidebar() {
  return (
    <React.Suspense
      fallback={
        <aside className="w-[270px] flex-shrink-0 border-r border-border bg-[#0d131f] h-screen sticky top-0" />
      }
    >
      <SidebarContent />
    </React.Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isWorkspace = pathname.startsWith("/workspace/");
  const currentProjectId = isWorkspace
    ? pathname.replace("/workspace/", "").split("?")[0]
    : "demo-robot-sme";
  const currentStage = (searchParams.get("stage") as AnalysisStage) || "brief";

  const [analysisState, setAnalysisState] = React.useState<AnalysisRunResponse | null>(null);

  React.useEffect(() => {
    if (isWorkspace && currentProjectId) {
      getAnalysisResults(currentProjectId).then((res) => {
        if (res) setAnalysisState(res);
      });
    }

    const handlePipelineUpdate = (e: any) => {
      if (e.detail) {
        setAnalysisState(e.detail);
      }
    };

    window.addEventListener("kizuna:pipeline-update", handlePipelineUpdate);
    return () => {
      window.removeEventListener("kizuna:pipeline-update", handlePipelineUpdate);
    };
  }, [isWorkspace, currentProjectId]);

  const getStageStatus = (stageId: AnalysisStage): { state: "completed" | "analyzing" | "queued" | "error"; msg?: string } => {
    if (!analysisState) {
      return { state: "queued" };
    }

    const isCompleted = analysisState.status === "completed";
    const isRunning = analysisState.status === "running";
    const progress = analysisState.progress || 0;
    const currentAgent = analysisState.current_agent;

    const hasResult = (agentName: string) =>
      analysisState.agent_results?.some((r) => r.agent_name === agentName);

    switch (stageId) {
      case "brief":
        if (hasResult("BriefExtractorAgent") || isCompleted || progress >= 16) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "BriefExtractorAgent" || progress <= 16)) {
          return { state: "analyzing", msg: "Extracting brief..." };
        }
        return { state: "queued" };

      case "market_lens":
        if (hasResult("MarketLensAgent") || isCompleted || progress >= 33) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "MarketLensAgent" || (progress > 16 && progress <= 33))) {
          return { state: "analyzing", msg: "Evaluating market fit..." };
        }
        return { state: "queued" };

      case "competitor_map":
        if (hasResult("CompetitorAgent") || isCompleted || progress >= 50) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "CompetitorAgent" || (progress > 33 && progress <= 50))) {
          return { state: "analyzing", msg: "Analyzing landscape..." };
        }
        return { state: "queued" };

      case "partner_match":
        if (hasResult("PartnerMatchAgent") || isCompleted || progress >= 66) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "PartnerMatchAgent" || (progress > 50 && progress <= 66))) {
          return { state: "analyzing", msg: "Evaluating partner fit..." };
        }
        return { state: "queued" };

      case "red_team":
        if (hasResult("RedTeamAgent") || isCompleted || progress >= 83) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "RedTeamAgent" || (progress > 66 && progress <= 83))) {
          return { state: "analyzing", msg: "Stress-testing risks..." };
        }
        return { state: "queued" };

      case "launch_plan":
        if (hasResult("ActionPlannerAgent") || isCompleted || progress >= 100) {
          return { state: "completed" };
        }
        if (isRunning && (currentAgent === "ActionPlannerAgent" || (progress > 83 && progress < 100))) {
          return { state: "analyzing", msg: "Synthesizing roadmap..." };
        }
        return { state: "queued" };

      case "executive_brief":
        if (isCompleted || hasResult("ActionPlannerAgent")) {
          return { state: "completed" };
        }
        if (isRunning && progress >= 95) {
          return { state: "analyzing", msg: "Preparing brief..." };
        }
        return { state: "queued" };
    }
  };

  return (
    <aside className="w-[270px] flex-shrink-0 border-r border-border bg-[#0d131f] flex flex-col justify-between h-screen sticky top-0">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 shrink-0">
              絆
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wide text-slate-100 truncate">
                KIZUNA AI
              </span>
              <span className="text-[10px] text-muted tracking-tight truncate">日印市場進出プラットフォーム</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-primary-600/15 text-primary-400 border border-primary-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-surface-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary-400" : "text-slate-400 group-hover:text-slate-200")} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-primary-600/20 text-primary-300 border border-primary-500/30 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* KIZUNA PIPELINE Stages (Complete Names + Real-Time Status) */}
          <div className="pt-2 border-t border-border/60">
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                KIZUNA Pipeline
              </span>
              {isWorkspace && (
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-800/40">
                  7 STAGES
                </span>
              )}
            </div>

            <div className="space-y-1">
              {PIPELINE_STAGES.map((stg) => {
                const Icon = stg.icon;
                const isCurrent = isWorkspace && currentStage === stg.id;
                const status = getStageStatus(stg.id);
                const targetHref = `/workspace/${currentProjectId}?stage=${stg.id}`;

                return (
                  <Link
                    key={stg.id}
                    href={targetHref}
                    className={cn(
                      "flex flex-col px-3 py-2 rounded-lg transition-all text-left group",
                      isCurrent
                        ? "bg-primary-600/20 text-slate-100 border border-primary-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-50/70"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", isCurrent ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                        <span className={cn(
                          "text-xs tracking-tight whitespace-nowrap font-medium",
                          isCurrent ? "text-slate-100 font-semibold" : "text-slate-300"
                        )}>
                          {stg.label}
                        </span>
                      </div>

                      {/* State Indicator */}
                      <div className="shrink-0 flex items-center justify-center">
                        {status.state === "completed" && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold" title="Completed">
                            ✓
                          </span>
                        )}
                        {status.state === "analyzing" && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/25 text-indigo-300 text-xs animate-pulse font-bold" title="Analyzing">
                            ◉
                          </span>
                        )}
                        {status.state === "queued" && (
                          <span className="inline-flex items-center justify-center w-4 h-4 text-slate-500 text-xs" title="Queued">
                            ○
                          </span>
                        )}
                        {status.state === "error" && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold" title="Failed">
                            ✕
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Short Status Message */}
                    {status.state === "analyzing" && (
                      <div className="pl-5.5 pt-0.5 text-[10px] text-indigo-300/90 font-medium animate-pulse">
                        {status.msg || stg.activeStatusMsg}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Bilateral Tag Footer */}
      <div className="p-4 border-t border-border bg-[#0a0e16]">
        <div className="p-3 rounded-lg bg-surface-100 border border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>JP ⇄ IN Strategic Corridor</span>
          </div>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            Autonomous bilateral market intelligence for Japanese enterprise expansion across India.
          </p>
        </div>
      </div>
    </aside>
  );
}
