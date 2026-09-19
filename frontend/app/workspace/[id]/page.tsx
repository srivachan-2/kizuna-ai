"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Compass,
  Radar,
  Users,
  ShieldAlert,
  CalendarDays,
  FileDown,
  ArrowLeft,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  X,
  Target,
  DollarSign,
  MapPin,
  Cpu,
  Shield,
  TrendingUp,
  Filter,
  Check,
  Building2,
  Info,
  Scale,
  Zap,
  Flame,
  AlertTriangle,
  Copy,
  CheckCheck,
  CheckSquare,
  Flag,
  Briefcase,
  Calendar,
  Send,
  RotateCcw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import {
  runAnalysis,
  stopAnalysis,
  getAnalysisResults,
  seedDemoProject,
  resetDemoProject,
  getLLMStatus,
  getExecutiveBrief,
  getExportPdfUrl,
  getExportMarkdownUrl
} from "@/lib/api";
import {
  AnalysisStage,
  BriefExtractionResult,
  MarketLensResult,
  CompetitorAnalysisResult,
  PartnerMatchResult,
  PartnerProfile,
  RedTeamResult,
  RiskItem,
  ActionPlannerResult,
  ActionTask,
  DecisionGate,
  PriorityAction,
  OutreachPack,
  ExecutiveBriefResult,
  AnalysisRunResponse
} from "@/types";

const STAGES: {
  id: AnalysisStage;
  num: string;
  shortLabel: string;
  fullLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "brief", num: "01", shortLabel: "Product", fullLabel: "Product Intelligence", icon: FileText },
  { id: "market_lens", num: "02", shortLabel: "Market", fullLabel: "Market Intelligence", icon: Compass },
  { id: "competitor_map", num: "03", shortLabel: "Competitor", fullLabel: "Competitor Intelligence", icon: Radar },
  { id: "partner_match", num: "04", shortLabel: "Partner", fullLabel: "Partner Matching", icon: Users },
  { id: "red_team", num: "05", shortLabel: "Risk", fullLabel: "Risk & Red Team", icon: ShieldAlert },
  { id: "launch_plan", num: "06", shortLabel: "Plan", fullLabel: "90-Day Launch Plan", icon: CalendarDays },
  { id: "executive_brief", num: "07", shortLabel: "Brief", fullLabel: "Executive Brief", icon: FileDown },
];

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = (params?.id as string) || "demo";
  const stageParam = (searchParams.get("stage") as AnalysisStage) || "brief";
  const [activeStage, setActiveStage] = useState<AnalysisStage>(stageParam);

  // Analysis State
  const [analysisState, setAnalysisState] = useState<AnalysisRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  // Filter state for competitors
  const [competitorFilter, setCompetitorFilter] = useState<"all" | "domestic" | "global" | "regional">("all");
  // State for partner match
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [showScoringInfo, setShowScoringInfo] = useState(false);
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("all");
  // State for red team
  const [riskCategoryFilter, setRiskCategoryFilter] = useState<string>("all");
  // State for Executive Brief (Phase 2E)
  const [briefLanguage, setBriefLanguage] = useState<"en" | "ja">("en");
  const [executiveBrief, setExecutiveBrief] = useState<ExecutiveBriefResult | null>(null);
  const [loadingExecutiveBrief, setLoadingExecutiveBrief] = useState(false);
  const [executiveBriefError, setExecutiveBriefError] = useState<string | null>(null);

  const fetchBrief = async (lang: "en" | "ja") => {
    setLoadingExecutiveBrief(true);
    setExecutiveBriefError(null);
    try {
      const data = await getExecutiveBrief(projectId, lang);
      setExecutiveBrief(data);
    } catch (err: any) {
      setExecutiveBriefError(err.message || "Failed to generate Executive Brief");
    } finally {
      setLoadingExecutiveBrief(false);
    }
  };

  const fetchResults = async () => {
    try {
      const data = await getAnalysisResults(projectId);
      setAnalysisState(data);
    } catch (err) {
      console.error("Failed to load results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [projectId]);

  useEffect(() => {
    if (analysisState && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kizuna:pipeline-update", { detail: analysisState }));
    }
  }, [analysisState]);

  useEffect(() => {
    if (activeStage === "executive_brief") {
      fetchBrief(briefLanguage);
    }
  }, [activeStage, briefLanguage, analysisState?.status, analysisState?.progress]);

  useEffect(() => {
    const s = searchParams.get("stage") as AnalysisStage;
    if (s && STAGES.some((item) => item.id === s)) {
      setActiveStage(s);
    }
  }, [searchParams]);

  const handleStageChange = (newStage: AnalysisStage) => {
    setActiveStage(newStage);
    router.push(`/workspace/${projectId}?stage=${newStage}`);
  };

  const [stoppingPipeline, setStoppingPipeline] = useState(false);

  // Managed polling effect to sync live pipeline progress and handle browser refresh recovery
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (runningPipeline || analysisState?.status === "running") {
      intervalId = setInterval(async () => {
        try {
          const data = await getAnalysisResults(projectId);
          if (data) {
            setAnalysisState(data);
            if (data.status !== "running") {
              setRunningPipeline(false);
              if (intervalId) clearInterval(intervalId);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 1500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [runningPipeline, analysisState?.status, projectId]);

  const getStageLoadingMessage = (progress: number, currentAgent?: string) => {
    if (currentAgent === "BriefExtractorAgent" || progress <= 16) {
      return "Analyzing product brief & value proposition...";
    }
    if (currentAgent === "MarketLensAgent" || (progress > 16 && progress <= 33)) {
      return "Evaluating Indian market viability & regional clusters...";
    }
    if (currentAgent === "CompetitorAgent" || (progress > 33 && progress <= 50)) {
      return "Mapping competitor landscape & whitespaces...";
    }
    if (currentAgent === "PartnerMatchAgent" || (progress > 50 && progress <= 66)) {
      return "Scoring and matching distribution partners...";
    }
    if (currentAgent === "RedTeamAgent" || (progress > 66 && progress <= 83)) {
      return "Stress-testing operational & regulatory risks...";
    }
    if (currentAgent === "ActionPlannerAgent" || (progress > 83 && progress < 100)) {
      return "Synthesizing 90-day launch roadmap...";
    }
    return "Preparing executive brief...";
  };

  const handleRunPipeline = async () => {
    if (runningPipeline || analysisState?.status === "running") {
      return;
    }
    setRunningPipeline(true);
    setErrorMessage(null);
    try {
      const res = await runAnalysis(projectId);
      if (res) {
        setAnalysisState(res);
      }
      await fetchResults();
    } catch (err: any) {
      setErrorMessage(err.message || "Pipeline execution failed. Verify backend and Gemini API connection.");
    } finally {
      setRunningPipeline(false);
      await fetchResults();
    }
  };

  const handleStopPipeline = async () => {
    if (stoppingPipeline) return;
    setStoppingPipeline(true);
    try {
      await stopAnalysis(projectId);
      setRunningPipeline(false);
      const data = await getAnalysisResults(projectId);
      if (data) {
        setAnalysisState({ ...data, status: "cancelled" });
      } else {
        setAnalysisState((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
    } catch (err: any) {
      setErrorMessage("Failed to stop analysis pipeline.");
    } finally {
      setStoppingPipeline(false);
    }
  };

  const [llmMode, setLlmMode] = useState<string>("gemini_live");
  const [resettingDemo, setResettingDemo] = useState(false);

  useEffect(() => {
    async function checkMode() {
      try {
        const s = await getLLMStatus();
        if (s && s.mode) {
          setLlmMode(s.mode);
        }
      } catch (e) {
        setLlmMode("mock_mode");
      }
    }
    checkMode();
  }, []);

  const handleResetDemo = async () => {
    setResettingDemo(true);
    setErrorMessage(null);
    try {
      await resetDemoProject();
      await fetchResults();
      setActiveStage("brief");
    } catch (err: any) {
      setErrorMessage("Failed to reset demo benchmark scenario.");
    } finally {
      setResettingDemo(false);
    }
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await seedDemoProject();
      router.push(`/workspace/demo-robot-sme?stage=${activeStage}`);
      const data = await getAnalysisResults("demo-robot-sme");
      setAnalysisState(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper resolvers for outputs from AgentResults array
  const briefResult: BriefExtractionResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "BriefExtractorAgent")?.output as BriefExtractionResult) ||
    (analysisState?.result_data?.brief as BriefExtractionResult) ||
    null;

  const marketResult: MarketLensResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "MarketLensAgent")?.output as MarketLensResult) ||
    (analysisState?.result_data?.market_lens as MarketLensResult) ||
    null;

  const competitorResult: CompetitorAnalysisResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "CompetitorAgent")?.output as CompetitorAnalysisResult) ||
    (analysisState?.result_data?.competitor_map as CompetitorAnalysisResult) ||
    null;

  const partnerResult: PartnerMatchResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "PartnerMatchAgent")?.output as PartnerMatchResult) ||
    (analysisState?.result_data?.partner_match as PartnerMatchResult) ||
    null;

  const redTeamResult: RedTeamResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "RedTeamAgent")?.output as RedTeamResult) ||
    (analysisState?.result_data?.red_team as RedTeamResult) ||
    null;

  const actionPlannerResult: ActionPlannerResult | null =
    (analysisState?.agent_results?.find((r) => r.agent_name === "ActionPlannerAgent")?.output as ActionPlannerResult) ||
    (analysisState?.result_data?.action_plan as ActionPlannerResult) ||
    null;

  const [copiedOutreach, setCopiedOutreach] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<"days_1_30" | "days_31_60" | "days_61_90">("days_1_30");

  const handleCopyOutreach = () => {
    if (actionPlannerResult?.outreach_pack) {
      const fullText = `Subject: ${actionPlannerResult.outreach_pack.subject}\n\n${actionPlannerResult.outreach_pack.message}\n\nNext Step: ${actionPlannerResult.outreach_pack.call_to_action}`;
      navigator.clipboard.writeText(fullText);
      setCopiedOutreach(true);
      setTimeout(() => setCopiedOutreach(false), 2500);
    }
  };

  const filteredCompetitors = competitorResult?.competitors?.filter((c) => {
    if (competitorFilter === "all") return true;
    return c.type === competitorFilter;
  }) || [];

  const filteredPartners = partnerResult?.partners?.filter((p) => {
    if (partnerTypeFilter === "all") return true;
    return p.partner_type.toLowerCase() === partnerTypeFilter.toLowerCase();
  }) || [];

  const filteredRisks = redTeamResult?.risks?.filter((r) => {
    if (riskCategoryFilter === "all") return true;
    return r.category.toLowerCase() === riskCategoryFilter.toLowerCase();
  }) || [];

  type StageProgressState = "completed" | "analyzing" | "queued" | "error";

  interface StageInfo {
    state: StageProgressState;
    summary: string;
    activeMsg: string;
  }

  const getStageInfo = (stageId: AnalysisStage): StageInfo => {
    const isRunning = runningPipeline || analysisState?.status === "running";
    const isCompleted = analysisState?.status === "completed";
    const progress = analysisState?.progress || 0;
    const currentAgent = analysisState?.current_agent;

    switch (stageId) {
      case "brief":
        if (briefResult || isCompleted || progress >= 16) {
          return {
            state: "completed",
            summary: "Product brief extracted",
            activeMsg: "Extracting product, industry and value proposition",
          };
        }
        if (isRunning && (currentAgent === "BriefExtractorAgent" || progress <= 16)) {
          return {
            state: "analyzing",
            summary: "Analyzing product brief...",
            activeMsg: "Extracting product, industry and value proposition",
          };
        }
        return {
          state: "queued",
          summary: "Pending initialization",
          activeMsg: "Waiting for brief input",
        };

      case "market_lens":
        if (marketResult || isCompleted || progress >= 33) {
          return {
            state: "completed",
            summary: `Market Fit: ${marketResult?.market_fit_score ?? 85}/100`,
            activeMsg: "Evaluating regions, market fit and policy signals",
          };
        }
        if (isRunning && (currentAgent === "MarketLensAgent" || (progress > 16 && progress <= 33))) {
          return {
            state: "analyzing",
            summary: "Evaluating market fit & clusters...",
            activeMsg: "Evaluating regions, market fit and policy signals",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for Product Intelligence",
          activeMsg: "Evaluating regions, market fit and policy signals",
        };

      case "competitor_map":
        if (competitorResult || isCompleted || progress >= 50) {
          const count = competitorResult?.competitors?.length || 3;
          return {
            state: "completed",
            summary: `${count} competitors identified`,
            activeMsg: "Analyzing competitive landscape",
          };
        }
        if (isRunning && (currentAgent === "CompetitorAgent" || (progress > 33 && progress <= 50))) {
          return {
            state: "analyzing",
            summary: "Mapping competitive landscape...",
            activeMsg: "Analyzing competitive landscape",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for Market Intelligence",
          activeMsg: "Analyzing competitive landscape",
        };

      case "partner_match":
        if (partnerResult || isCompleted || progress >= 66) {
          const count = partnerResult?.partners?.length || 4;
          return {
            state: "completed",
            summary: `${count} candidate partners evaluated`,
            activeMsg: "Evaluating partner fit and pilot readiness",
          };
        }
        if (isRunning && (currentAgent === "PartnerMatchAgent" || (progress > 50 && progress <= 66))) {
          return {
            state: "analyzing",
            summary: "Evaluating partner candidates...",
            activeMsg: "Evaluating partner fit and pilot readiness",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for Competitor Intelligence",
          activeMsg: "Evaluating partner fit and pilot readiness",
        };

      case "red_team":
        if (redTeamResult || isCompleted || progress >= 83) {
          const count = redTeamResult?.risks?.length || 5;
          return {
            state: "completed",
            summary: `${count} critical risks analyzed`,
            activeMsg: "Stress-testing regulatory, market and execution risks",
          };
        }
        if (isRunning && (currentAgent === "RedTeamAgent" || (progress > 66 && progress <= 83))) {
          return {
            state: "analyzing",
            summary: "Stress-testing risks...",
            activeMsg: "Stress-testing regulatory, market and execution risks",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for Partner Matching",
          activeMsg: "Stress-testing regulatory, market and execution risks",
        };

      case "launch_plan":
        if (actionPlannerResult || isCompleted || progress >= 100) {
          return {
            state: "completed",
            summary: "Launch roadmap generated",
            activeMsg: "Building prioritized entry actions and decision gates",
          };
        }
        if (isRunning && (currentAgent === "ActionPlannerAgent" || (progress > 83 && progress < 100))) {
          return {
            state: "analyzing",
            summary: "Synthesizing 90-day actions...",
            activeMsg: "Building prioritized entry actions and decision gates",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for Risk & Red Team",
          activeMsg: "Building prioritized entry actions and decision gates",
        };

      case "executive_brief":
        if (isCompleted || actionPlannerResult) {
          return {
            state: "completed",
            summary: "Bilingual brief ready",
            activeMsg: "Preparing executive decision brief",
          };
        }
        if (isRunning && progress >= 95) {
          return {
            state: "analyzing",
            summary: "Preparing executive brief...",
            activeMsg: "Preparing executive decision brief",
          };
        }
        return {
          state: "queued",
          summary: "Waiting for 90-Day Plan",
          activeMsg: "Preparing executive decision brief",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400">
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              Workspace: {projectId === "demo-robot-sme" ? "Demo: Compact Robot (CR-500)" : projectId}
            </span>
            <Badge variant="indigo">Smart Manufacturing</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant={llmMode === "gemini_live" ? "success" : "outline"}
            className="text-[10px] py-1 px-2.5 gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${llmMode === "gemini_live" ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`}></span>
            <span>{llmMode === "gemini_live" ? "LIVE AI (GEMINI)" : "DEMO / FALLBACK MODE"}</span>
          </Badge>

          {(projectId === "demo-robot-sme" || projectId === "demo") ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              disabled={resettingDemo || runningPipeline}
              className="text-xs gap-1.5 border-border hover:bg-surface-50 text-slate-300"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resettingDemo ? "animate-spin" : ""}`} />
              <span>{resettingDemo ? "Resetting..." : "Reset Demo"}</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLoadDemo} className="text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Robot Demo Scenario</span>
            </Button>
          )}

          <StatusPill
            status={
              analysisState?.status === "completed"
                ? "completed"
                : (analysisState?.status === "running" || runningPipeline)
                ? "analyzing"
                : analysisState?.status === "cancelled"
                ? "draft"
                : analysisState?.status === "failed"
                ? "failed"
                : "draft"
            }
            label={
              analysisState?.status === "completed"
                ? "6-Agent Pipeline Complete"
                : (analysisState?.status === "running" || runningPipeline)
                ? `Agent Running (${analysisState?.progress || 14}%)`
                : analysisState?.status === "cancelled"
                ? "Analysis Cancelled"
                : analysisState?.status === "failed"
                ? "Analysis Failed"
                : "Draft Brief"
            }
          />
        </div>
      </div>

      {/* Graceful Alert / Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300">System Notice:</span>
              <p>
                {errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("RESOURCE_EXHAUSTED")
                  ? "Google Gemini API rate limit reached. KIZUNA is utilizing its curated decision-support intelligence fallback."
                  : errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-400 hover:text-amber-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Horizontal Top Stepper — Visual Flow Only */}
      <div className="bg-[#0c121e] border border-border/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between relative px-2 sm:px-4">
          {STAGES.map((s, idx) => {
            const isActive = activeStage === s.id;
            const stageInfo = getStageInfo(s.id);
            const isLast = idx === STAGES.length - 1;

            return (
              <React.Fragment key={s.id}>
                {/* Flow Step Node */}
                <button
                  onClick={() => handleStageChange(s.id)}
                  className={`flex flex-col items-center gap-1.5 z-10 group relative transition-all outline-none ${
                    isActive ? "scale-105" : "hover:opacity-100 opacity-80"
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold font-mono transition-all ${
                      isActive
                        ? "bg-primary-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-primary-400 ring-offset-2 ring-offset-[#0c121e]"
                        : stageInfo.state === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : stageInfo.state === "analyzing"
                        ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 animate-pulse"
                        : "bg-surface-50 text-slate-400 border border-border/80"
                    }`}
                  >
                    {stageInfo.state === "completed" ? (
                      <span className="text-xs font-bold text-emerald-400">✓</span>
                    ) : stageInfo.state === "analyzing" ? (
                      <span className="text-xs font-bold text-indigo-300 animate-pulse">◉</span>
                    ) : (
                      <span>{s.num}</span>
                    )}
                  </div>

                  {/* Flow Label & State Indicator */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-indigo-300 font-semibold"
                          : stageInfo.state === "completed"
                          ? "text-slate-200"
                          : "text-slate-400"
                      }`}
                    >
                      {s.shortLabel}
                    </span>
                    <span
                      className={`text-[10px] font-mono leading-none mt-0.5 ${
                        stageInfo.state === "completed"
                          ? "text-emerald-400 font-bold"
                          : stageInfo.state === "analyzing"
                          ? "text-indigo-300 font-bold animate-pulse"
                          : "text-slate-500"
                      }`}
                    >
                      {stageInfo.state === "completed"
                        ? "✓"
                        : stageInfo.state === "analyzing"
                        ? "◉"
                        : "○"}
                    </span>
                  </div>
                </button>

                {/* Connecting Line Between Stages */}
                {!isLast && (
                  <div className="flex-1 mx-1 sm:mx-3 h-0.5 self-center mb-6 relative">
                    <div
                      className={`h-full w-full transition-all duration-300 ${
                        stageInfo.state === "completed"
                          ? "bg-emerald-500/60"
                          : stageInfo.state === "analyzing"
                          ? "bg-gradient-to-r from-indigo-500/60 via-indigo-500/30 to-border animate-pulse"
                          : "bg-border/60"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Pipeline Action Header */}
      <div className="rounded-2xl bg-[#0f1624] border border-border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Bot className="w-4 h-4" />
            <span>Autonomous Market Entry Pipeline</span>
            <Badge variant="success">KIZUNA Intelligence Pipeline</Badge>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {activeStage === "brief" && "Stage 1: Japanese Product Brief Extraction"}
            {activeStage === "market_lens" && "Stage 2: India Market Lens & Viability Analysis"}
            {activeStage === "competitor_map" && "Stage 3: Competitor Intelligence & Market Gaps"}
            {activeStage === "partner_match" && "Stage 4: Partner Matching & Scoring"}
            {activeStage === "red_team" && "Stage 5: Risk & Adversarial Red Team"}
            {activeStage === "launch_plan" && "Stage 6: 90-Day Operational Launch Plan"}
            {activeStage === "executive_brief" && "Stage 7: Boardroom Executive Brief & Export"}
          </h2>
          <p className="text-xs text-muted max-w-2xl">
            {runningPipeline || analysisState?.status === "running"
              ? getStageLoadingMessage(analysisState?.progress || 14, analysisState?.current_agent)
              : "Autonomous bilateral intelligence execution: Brief (14%) → Market (29%) → Competitor (43%) → Partner (57%) → Risk (71%) → 90-Day Plan (86%) → Executive Brief (100%)."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {runningPipeline || analysisState?.status === "running" ? (
            <>
              <Button
                variant="primary"
                size="md"
                disabled
                className="gap-2 shrink-0 opacity-90 cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {getStageLoadingMessage(analysisState?.progress || 14, analysisState?.current_agent)} ({analysisState?.progress || 14}%)
                </span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleStopPipeline}
                disabled={stoppingPipeline}
                className="gap-1.5 border-rose-500/40 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 text-xs shrink-0"
                title="Safely cancel the running intelligence pipeline"
              >
                <X className={`w-3.5 h-3.5 ${stoppingPipeline ? "animate-spin" : "text-rose-400"}`} />
                <span>{stoppingPipeline ? "Stopping..." : "Stop Analysis"}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleRunPipeline}
              disabled={runningPipeline}
              className="gap-2 shrink-0 shadow-lg shadow-indigo-600/20"
            >
              <Play className="w-4 h-4" />
              <span>
                {analysisState?.status === "completed"
                  ? "Re-Run Complete Pipeline"
                  : analysisState?.status === "cancelled"
                  ? "Resume / Run Pipeline"
                  : analysisState?.status === "failed"
                  ? "Retry Pipeline"
                  : "Run Agentic Pipeline"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 1: BRIEF INTELLIGENCE VIEW                             */}
      {/* ============================================================= */}
      {activeStage === "brief" && (
        <div className="space-y-6">
          {!briefResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">No Intelligence Extracted Yet</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Click &ldquo;Run Agentic Pipeline&rdquo; above to extract structured facts and evaluate market viability with Google Gemini.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                <span>Execute Pipeline</span>
              </Button>
            </Card>
          )}

          {briefResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Stage Status</span>
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Brief Extraction Complete
                    </span>
                  </div>
                  <Badge variant="success">Factual Extraction</Badge>
                </div>

                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Extraction Confidence</span>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {Math.round(briefResult.confidence * 100)}%
                    </span>
                  </div>
                  <Badge variant="indigo">High Fidelity</Badge>
                </div>

                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Next Pipeline Step</span>
                    <span className="text-xs font-semibold text-slate-200 block mt-0.5">Market Lens Agent</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStageChange("market_lens")}
                    className="text-xs gap-1.5"
                  >
                    <span>View Market Lens</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Product Intelligence Matrix */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>PRODUCT INTELLIGENCE</span>
                    </CardTitle>
                    <CardDescription>
                      Extracted facts validated against KIZUNA schema from Japanese technical brief
                    </CardDescription>
                  </div>
                  <Badge variant="default">{briefResult.origin_country}</Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Product</span>
                      <span className="font-semibold text-slate-100 text-sm">{briefResult.product_name}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Category</span>
                      <span className="font-semibold text-slate-200">{briefResult.product_category}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Company (Origin)</span>
                      <span className="font-semibold text-slate-200">
                        {briefResult.company_name} ({briefResult.origin_country})
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Target Market</span>
                      <span className="font-semibold text-slate-200">{briefResult.target_market}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Target Customer</span>
                      <span className="font-semibold text-slate-200">{briefResult.target_customer}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Price Range</span>
                      <span className="font-mono font-semibold text-indigo-300">{briefResult.price_range}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Launch Timeline</span>
                      <span className="font-semibold text-slate-200">{briefResult.launch_timeline}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Business Model</span>
                      <span className="font-semibold text-slate-200">{briefResult.business_model}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                      <span className="text-muted block text-[11px]">Target Industrial Regions</span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {briefResult.target_regions.length > 0 ? (
                          briefResult.target_regions.map((r, i) => (
                            <Badge key={i} variant="indigo" className="text-[10px]">
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-50 border border-border/80 space-y-1.5">
                    <span className="text-muted block text-[11px] font-medium">Product Description & Core Moat</span>
                    <p className="text-slate-300 leading-relaxed">{briefResult.product_description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements & Constraints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>KEY REQUIREMENTS</span>
                    </CardTitle>
                    <CardDescription>Technical and commercial prerequisites</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {briefResult.key_requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-md bg-surface-50 border border-border/70 flex items-start gap-2 text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>ASSUMPTIONS</span>
                    </CardTitle>
                    <CardDescription>Assumptions made where information was implicit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {briefResult.assumptions.length > 0 ? (
                      briefResult.assumptions.map((assump, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-surface-50 border border-border/70 text-slate-300 leading-relaxed"
                        >
                          <span className="text-indigo-400 font-mono mr-1.5">[{idx + 1}]</span>
                          {assump}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No external assumptions required.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 2: MARKET LENS VIEW (PHASE 2B LIVE AGENT)              */}
      {/* ============================================================= */}
      {activeStage === "market_lens" && (
        <div className="space-y-6">
          {!marketResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <Compass className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Market Lens Not Executed Yet</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Run the agentic pipeline to evaluate India market opportunity, regional clusters, and demand signals.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Run Market Lens Analysis</span>
              </Button>
            </Card>
          )}

          {marketResult && (
            <div className="space-y-6">
              {/* Top KPI Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Market Fit Score */}
                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">AI Market Fit Score</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-bold text-slate-100 font-mono">{marketResult.market_fit_score}</span>
                      <span className="text-xs text-muted">/ 100</span>
                    </div>
                  </div>
                  <Badge variant={marketResult.market_fit_score >= 75 ? "success" : "warning"}>
                    {marketResult.market_fit_score >= 75 ? "Strong Viability" : "Moderate Viability"}
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Strategic Positioning</span>
                    <span className="text-xs font-semibold text-indigo-300 line-clamp-1 mt-0.5">
                      {marketResult.positioning}
                    </span>
                  </div>
                  <Badge variant="indigo">AI INFERENCE</Badge>
                </div>

                <div className="p-4 rounded-xl bg-surface-100 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Confidence Rating</span>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {Math.round(marketResult.confidence * 100)}%
                    </span>
                  </div>
                  <Badge variant="default">Grounded Data</Badge>
                </div>
              </div>

              {/* Market Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>MARKET SUMMARY & OPPORTUNITY OVERVIEW</span>
                  </CardTitle>
                  <CardDescription>
                    Opportunity analysis synthesized from curated India manufacturing datasets and Gemini reasoning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <p className="text-slate-300 leading-relaxed text-sm bg-surface-50 p-4 rounded-lg border border-border/80">
                    {marketResult.market_summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-lg bg-surface-50 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Target Indian Segments</span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/30">
                          AI INFERENCE
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {marketResult.target_segments.map((seg, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span>{seg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-surface-50 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Customer Pain Points & Needs</span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/30">
                          AI INFERENCE
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {marketResult.customer_needs.map((need, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{need}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority Indian Industrial Clusters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>PRIORITY REGIONAL INDUSTRIAL CLUSTERS</span>
                  </CardTitle>
                  <CardDescription>
                    Evaluation of manufacturing ecosystems in Tamil Nadu, Gujarat, Delhi-NCR, and Karnataka
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {marketResult.priority_regions.map((reg, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{reg.region}</span>
                          </span>
                          <Badge
                            variant={
                              reg.relevance.toLowerCase().includes("high")
                                ? "success"
                                : "indigo"
                            }
                          >
                            {reg.relevance} Relevance
                          </Badge>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{reg.reasoning}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted">
                          <span className="text-emerald-400">SOURCE DATA GROUNDED</span>
                          <span className="font-mono">Confidence: {Math.round(reg.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Demand Signals & Entry Considerations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>DEMAND SIGNALS & OPPORTUNITIES</span>
                    </CardTitle>
                    <CardDescription>Market tailwinds and direct opportunities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      {marketResult.opportunities.map((opp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-surface-50 border border-border/70 flex items-start gap-2 text-slate-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{opp}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>ENTRY CONSIDERATIONS & EVIDENCE</span>
                    </CardTitle>
                    <CardDescription>Regulatory hurdles and grounded evidence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      {marketResult.market_entry_considerations.map((con, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-amber-950/20 border border-amber-800/30 text-amber-200"
                        >
                          • {con}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-300 block">Ground Truth Evidence:</span>
                      {marketResult.evidence.map((ev, idx) => (
                        <div key={idx} className="p-2 rounded bg-surface-50 text-[11px] text-slate-400 font-mono">
                          [SOURCE] {ev}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 3: COMPETITOR INTELLIGENCE VIEW (PHASE 2B LIVE AGENT)  */}
      {/* ============================================================= */}
      {activeStage === "competitor_map" && (
        <div className="space-y-6">
          {!competitorResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <Radar className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Competitor Map Not Executed Yet</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Run the agentic pipeline to build a grounded competitor matrix and uncover market positioning opportunities.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Run Competitor Analysis</span>
              </Button>
            </Card>
          )}

          {competitorResult && (
            <div className="space-y-6">
              {/* Competitive Summary & Filter Bar */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Radar className="w-4 h-4 text-indigo-400" />
                      <span>COMPETITIVE LANDSCAPE MATRIX</span>
                    </CardTitle>
                    <CardDescription>
                      Mapped domestic alternatives vs global incumbents grounded in curated registries
                    </CardDescription>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setCompetitorFilter("all")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        competitorFilter === "all"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All ({competitorResult.competitors.length})
                    </button>
                    <button
                      onClick={() => setCompetitorFilter("domestic")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        competitorFilter === "domestic"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Domestic Low-Cost
                    </button>
                    <button
                      onClick={() => setCompetitorFilter("global")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        competitorFilter === "global"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Global Incumbents
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-lg bg-surface-50 border border-border/80 text-slate-300 leading-relaxed text-sm">
                    {competitorResult.competitive_summary}
                  </div>

                  {/* Competitor Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {filteredCompetitors.map((comp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-50 border border-border/80 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100 text-sm">{comp.name}</span>
                            <Badge
                              variant={
                                comp.type === "domestic"
                                  ? "success"
                                  : comp.type === "global"
                                  ? "indigo"
                                  : "default"
                              }
                            >
                              {comp.type.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] text-muted block">{comp.product_category}</span>
                            <span className="text-xs font-mono text-indigo-300 block">{comp.pricing}</span>
                            <span className="text-[10px] text-muted italic block">Benchmarked Competitor Profile • Curated Intelligence</span>
                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            <strong className="text-slate-200">Positioning:</strong> {comp.positioning}
                          </p>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-semibold text-emerald-400 block uppercase">
                              Strengths:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {comp.strengths.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-emerald-950/30 text-emerald-300 text-[10px] border border-emerald-800/30"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-semibold text-rose-400 block uppercase">
                              Weaknesses / Gaps:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {comp.weaknesses.map((w, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-rose-950/30 text-rose-300 text-[10px] border border-rose-800/30"
                                >
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60 space-y-1">
                          <span className="text-[10px] font-semibold text-amber-300 uppercase block">
                            Visible Opportunity Gap:
                          </span>
                          <p className="text-[11px] text-amber-200 bg-amber-950/20 p-2 rounded border border-amber-800/30">
                            {comp.visible_gap}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Gaps & Positioning Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>UNADDRESSED MARKET GAPS (WHITESPACES)</span>
                    </CardTitle>
                    <CardDescription>Gaps between low-cost domestic and premium global options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {competitorResult.market_gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-surface-50 border border-border/70 flex items-start gap-2 text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>STRATEGIC POSITIONING OPPORTUNITIES</span>
                    </CardTitle>
                    <CardDescription>Winning positioning angles for the Japanese entrant</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {competitorResult.positioning_opportunities.map((pos, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-800/30 text-indigo-200 flex items-start gap-2"
                      >
                        <span className="text-indigo-400 font-bold">[{idx + 1}]</span>
                        <span>{pos}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 4: PARTNER MATCH VIEW (PHASE 2C LIVE AGENT)             */}
      {/* ============================================================= */}
      {activeStage === "partner_match" && (
        <div className="space-y-6">
          {!partnerResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Partner Matching Not Executed Yet</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Run the agentic pipeline to evaluate qualified Indian system integrators, distributors, and joint venture candidates with transparent multi-criteria scoring.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Run Partner Matching</span>
              </Button>
            </Card>
          )}

          {partnerResult && (
            <div className="space-y-6">
              {/* Strategy Banner & Transparent Scoring Drawer Toggle */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>INDIA GO-TO-MARKET PARTNER MATCHING</span>
                    </CardTitle>
                    <CardDescription>
                      Qualified regional partners evaluated via deterministic multi-criteria fit scoring
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScoringInfo(!showScoringInfo)}
                      className="text-xs gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/30"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>How is this score calculated?</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Strategy Summary */}
                  <div className="p-4 rounded-lg bg-surface-50 border border-border/80 text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                        Market Entry Strategy
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        CONFIDENCE: {Math.round(partnerResult.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{partnerResult.market_entry_strategy}</p>
                    <p className="text-slate-400 text-xs">{partnerResult.summary}</p>
                  </div>

                  {/* Transparent Scoring Criteria Drawer */}
                  {showScoringInfo && (
                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-200">
                            TRANSPARENT 100-POINT SCORING METHODOLOGY
                          </span>
                        </div>
                        <button
                          onClick={() => setShowScoringInfo(false)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Scores are calculated deterministically across 6 objective dimensions based on structured partner capability registries, preventing subjective LLM hallucinations.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Market Fit</span>
                          <span className="text-xs font-bold text-indigo-300">25% (25 pts)</span>
                        </div>
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Industry Fit</span>
                          <span className="text-xs font-bold text-indigo-300">20% (20 pts)</span>
                        </div>
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Technical Fit</span>
                          <span className="text-xs font-bold text-indigo-300">20% (20 pts)</span>
                        </div>
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Geographic Fit</span>
                          <span className="text-xs font-bold text-indigo-300">15% (15 pts)</span>
                        </div>
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Distribution</span>
                          <span className="text-xs font-bold text-indigo-300">10% (10 pts)</span>
                        </div>
                        <div className="p-2 rounded bg-surface-100 border border-border text-center">
                          <span className="text-[10px] text-muted block">Pilot Capability</span>
                          <span className="text-xs font-bold text-indigo-300">10% (10 pts)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Partner Type Filter */}
                  <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-lg border border-border w-fit">
                    <button
                      onClick={() => setPartnerTypeFilter("all")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        partnerTypeFilter === "all"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All Types ({partnerResult.partners.length})
                    </button>
                    <button
                      onClick={() => setPartnerTypeFilter("System Integrator")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        partnerTypeFilter.toLowerCase() === "system integrator"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      System Integrators
                    </button>
                    <button
                      onClick={() => setPartnerTypeFilter("Distributor")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        partnerTypeFilter.toLowerCase() === "distributor"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Distributors
                    </button>
                    <button
                      onClick={() => setPartnerTypeFilter("Technology Partner")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        partnerTypeFilter.toLowerCase() === "technology partner"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Tech Partners
                    </button>
                    <button
                      onClick={() => setPartnerTypeFilter("Joint Venture Candidate")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        partnerTypeFilter.toLowerCase() === "joint venture candidate"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      JV Candidates
                    </button>
                  </div>

                  {/* Evaluated Partner Cards */}
                  <div className="space-y-4 pt-2">
                    {filteredPartners.map((partner, idx) => {
                      const isExpanded = expandedPartner === partner.name;
                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-xl bg-surface-50 border border-border/80 hover:border-border transition-all space-y-4"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-base font-bold text-slate-100">{partner.name}</span>
                                <Badge variant="indigo">{partner.partner_type}</Badge>
                                <span className="px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 text-[11px] font-semibold border border-emerald-800/30">
                                  Role: {partner.recommended_role}
                                </span>
                                <span className="text-[10px] text-muted italic block w-full">
                                  Curated Demo Partner Record • Illustrative Candidate
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                <strong className="text-slate-200">Why this partner:</strong> {partner.reasoning}
                              </p>
                            </div>

                            {/* Total Fit Score Gauge */}
                            <div className="flex items-center gap-4 shrink-0 bg-surface-100 px-4 py-2.5 rounded-xl border border-border">
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-semibold text-muted block">Fit Score</span>
                                <span className="text-xl font-mono font-bold text-emerald-400">
                                  {partner.fit_score}
                                  <span className="text-xs text-muted font-normal">/100</span>
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedPartner(isExpanded ? null : partner.name)}
                                className="gap-1 text-xs text-slate-300"
                              >
                                <span>{isExpanded ? "Collapse" : "Details"}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>

                          {/* 6-Dimension Score Breakdown Meters */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 border-t border-border/60">
                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Market</span>
                                <span className="font-mono text-slate-200">{partner.market_fit}/25</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(partner.market_fit / 25) * 100}%` }} />
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Industry</span>
                                <span className="font-mono text-slate-200">{partner.industry_fit}/20</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(partner.industry_fit / 20) * 100}%` }} />
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Technical</span>
                                <span className="font-mono text-slate-200">{partner.technical_fit}/20</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(partner.technical_fit / 20) * 100}%` }} />
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Geographic</span>
                                <span className="font-mono text-slate-200">{partner.geographic_fit}/15</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(partner.geographic_fit / 15) * 100}%` }} />
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Distribution</span>
                                <span className="font-mono text-slate-200">{partner.distribution_fit}/10</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(partner.distribution_fit / 10) * 100}%` }} />
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100/70 border border-border/50">
                              <div className="flex justify-between text-[10px] text-muted mb-1">
                                <span>Pilot PoC</span>
                                <span className="font-mono text-slate-200">{partner.pilot_fit}/10</span>
                              </div>
                              <div className="w-full bg-surface-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(partner.pilot_fit / 10) * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Strengths & Concerns Pills */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                                Core Capabilities & Strengths:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {partner.strengths.map((st, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-300 text-[11px] border border-emerald-800/30 flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>{st}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                                Identified Risks & Partner Concerns:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {partner.concerns.map((co, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-amber-950/20 text-amber-300 text-[11px] border border-amber-800/30 flex items-center gap-1"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    <span>{co}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Expandable Deep Dive View */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-border/70 space-y-2 animate-in fade-in duration-200">
                              <div className="flex items-center justify-between text-[11px] text-muted">
                                <span>Grounding Source: <strong className="text-slate-300 font-mono">[SOURCE DATA] {partner.source || "Curated demo dataset"}</strong></span>
                                <span>Agent Evaluation Confidence: <strong className="text-slate-300 font-mono">{Math.round(partner.confidence * 100)}%</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 5: RISK & RED TEAM VIEW (PHASE 2C LIVE AGENT)            */}
      {/* ============================================================= */}
      {activeStage === "red_team" && (
        <div className="space-y-6">
          {!redTeamResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Risk & Red Team Analysis Not Executed</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Run the adversarial red-team pipeline to challenge entry assumptions across 10 risk dimensions with deterministic likelihood × impact scoring.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Run Red Team Stress Test</span>
              </Button>
            </Card>
          )}

          {redTeamResult && (
            <div className="space-y-6">
              {/* Top Summary Banner with Overall Risk Level */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>ADVERSARIAL RED-TEAM RISK MATRIX</span>
                    </CardTitle>
                    <CardDescription>
                      Stress-testing bilateral market entry across 10 operational, legal, and commercial categories
                    </CardDescription>
                  </div>

                  {/* Overall Risk Gauge */}
                  <div className="flex items-center gap-3 bg-surface-50 px-3.5 py-1.5 rounded-xl border border-border">
                    <span className="text-xs text-muted font-medium">OVERALL RISK LEVEL:</span>
                    <Badge
                      variant={
                        redTeamResult.overall_risk === "Critical"
                          ? "destructive"
                          : redTeamResult.overall_risk === "High"
                          ? "warning"
                          : redTeamResult.overall_risk === "Medium"
                          ? "indigo"
                          : "success"
                      }
                      className="text-xs uppercase font-bold"
                    >
                      {redTeamResult.overall_risk}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-lg bg-surface-50 border border-border/80 text-slate-300 leading-relaxed text-sm">
                    {redTeamResult.challenge_summary}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-lg border border-border overflow-x-auto">
                    <button
                      onClick={() => setRiskCategoryFilter("all")}
                      className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                        riskCategoryFilter === "all"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All Risks ({redTeamResult.risks.length})
                    </button>
                    {Array.from(new Set(redTeamResult.risks.map((r) => r.category))).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setRiskCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                          riskCategoryFilter.toLowerCase() === cat.toLowerCase()
                            ? "bg-primary-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Risk Cards Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {filteredRisks.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-50 border border-border/80 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-muted uppercase block">{risk.category}</span>
                              <span className="font-bold text-slate-100 text-sm block">{risk.title}</span>
                            </div>
                            <Badge
                              variant={
                                risk.severity === "Critical"
                                  ? "destructive"
                                  : risk.severity === "High"
                                  ? "warning"
                                  : risk.severity === "Medium"
                                  ? "indigo"
                                  : "success"
                              }
                            >
                              {risk.severity} ({risk.risk_score}/25)
                            </Badge>
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed">{risk.description}</p>

                          {/* Likelihood x Impact Meters */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="p-2 rounded bg-surface-100 border border-border/50">
                              <span className="text-[10px] text-muted block mb-0.5">Likelihood (1-5)</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                  <div
                                    key={lvl}
                                    className={`h-2 flex-1 rounded-sm ${
                                      lvl <= risk.likelihood ? "bg-amber-400" : "bg-surface-50"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-mono font-bold text-slate-200 ml-1">{risk.likelihood}</span>
                              </div>
                            </div>

                            <div className="p-2 rounded bg-surface-100 border border-border/50">
                              <span className="text-[10px] text-muted block mb-0.5">Impact (1-5)</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                  <div
                                    key={lvl}
                                    className={`h-2 flex-1 rounded-sm ${
                                      lvl <= risk.impact ? "bg-rose-500" : "bg-surface-50"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-mono font-bold text-slate-200 ml-1">{risk.impact}</span>
                              </div>
                            </div>
                          </div>

                          {/* Challenged Assumption */}
                          <div className="pt-2 border-t border-border/60 space-y-1">
                            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                              Challenged Assumption:
                            </span>
                            <p className="text-[11px] text-slate-300 bg-rose-950/20 p-2 rounded border border-rose-800/30">
                              {risk.assumption}
                            </p>
                          </div>

                          {/* Actionable Mitigation */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                              Actionable Mitigation:
                            </span>
                            <p className="text-[11px] text-slate-300 bg-emerald-950/20 p-2 rounded border border-emerald-800/30">
                              {risk.mitigation}
                            </p>
                          </div>
                        </div>

                        {/* Evidence Tag */}
                        {risk.evidence && risk.evidence.length > 0 && (
                          <div className="pt-1 text-[10px] text-muted font-mono">
                            [EVIDENCE] {risk.evidence.join(" | ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Challenge the Recommendation Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>WEAK / FRAGILE ASSUMPTIONS</span>
                    </CardTitle>
                    <CardDescription>Unverified premises exposed by adversarial review</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {redTeamResult.weak_assumptions.map((assump, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/30 flex items-start gap-2 text-rose-200"
                      >
                        <span className="text-rose-400 font-bold">[{idx + 1}]</span>
                        <span>{assump}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>RECOMMENDATION CHALLENGES</span>
                    </CardTitle>
                    <CardDescription>Direct counter-arguments against entry timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {redTeamResult.recommendation_challenges.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-surface-50 border border-border/70 flex items-start gap-2 text-slate-200"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{ch}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>PRIORITY ACTIONABLE MITIGATIONS</span>
                    </CardTitle>
                    <CardDescription>Pre-conditions before committing foreign capital</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {redTeamResult.mitigations.map((mit, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-start gap-2 text-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{mit}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* STAGE 6: 90-DAY LAUNCH PLAN (PHASE 2D LIVE AGENT)              */}
      {/* ============================================================= */}
      {activeStage === "launch_plan" && (
        <div className="space-y-6">
          {!actionPlannerResult && !runningPipeline && (
            <Card className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                <CalendarDays className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">90-Day Execution Plan Not Generated Yet</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Run the full 6-agent intelligence pipeline to synthesize upstream findings into an actionable 90-day roadmap, decision gates, and partner outreach pack.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleRunPipeline} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Generate 90-Day Execution Plan</span>
              </Button>
            </Card>
          )}

          {actionPlannerResult && (
            <div className="space-y-6">
              {/* Executive Recommendation & Entry Strategy */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-400" />
                      <span>INDIA MARKET ENTRY EXECUTION PLAN</span>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive operational synthesis with Red Team risk mitigation and phased stage gates
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-xs">
                      PHASED 90-DAY PILOT
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-2">
                      <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                        Executive Recommendation:
                      </span>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {actionPlannerResult.executive_recommendation}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-2">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        Go-To-Market Entry Strategy:
                      </span>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {actionPlannerResult.entry_strategy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NEXT 3 PRIORITY ACTIONS */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>NEXT 3 PRIORITY ACTIONS (IMMEDIATE START)</span>
                  </CardTitle>
                  <CardDescription>
                    High-urgency operational steps directly derived from Market, Partner, and Red Team insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {actionPlannerResult.priority_actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-50 border border-amber-500/30 flex flex-col justify-between space-y-3 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-100 text-xs">{act.action}</span>
                          </div>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-semibold text-amber-400 block">
                              Why Now:
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{act.why_now}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-border/60">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
                              Expected Deliverable:
                            </span>
                            <span className="text-[11px] text-slate-200 block">{act.expected_outcome}</span>
                          </div>
                          {act.dependency && act.dependency !== "None" && (
                            <div className="text-[10px] text-muted font-mono">
                              Dependency: {act.dependency}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 90-DAY EXECUTION TIMELINE ROADMAP */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>90-DAY MILESTONE ROADMAP</span>
                    </CardTitle>
                    <CardDescription>
                      Structured in three 30-day operational execution phases
                    </CardDescription>
                  </div>

                  {/* Stage Tabs */}
                  <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setActivePlanTab("days_1_30")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        activePlanTab === "days_1_30"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Days 1–30: Validation
                    </button>
                    <button
                      onClick={() => setActivePlanTab("days_31_60")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        activePlanTab === "days_31_60"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Days 31–60: Partner & Pilot
                    </button>
                    <button
                      onClick={() => setActivePlanTab("days_61_90")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        activePlanTab === "days_61_90"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Days 61–90: Scale Decision
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Task List for Active Tab */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(actionPlannerResult[activePlanTab] || []).map((taskItem, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-50 border border-border/80 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-100 text-sm">{taskItem.task}</span>
                            <Badge
                              variant={
                                taskItem.priority === "Critical"
                                  ? "destructive"
                                  : taskItem.priority === "High"
                                  ? "warning"
                                  : "indigo"
                              }
                            >
                              {taskItem.priority}
                            </Badge>
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed">{taskItem.description}</p>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div className="p-1.5 rounded bg-surface-100 border border-border/50">
                              <span className="text-[10px] text-muted block">Owner</span>
                              <span className="font-semibold text-slate-200">{taskItem.owner}</span>
                            </div>
                            <div className="p-1.5 rounded bg-surface-100 border border-border/50">
                              <span className="text-[10px] text-muted block">Dependency</span>
                              <span className="text-slate-300 truncate block">{taskItem.dependency}</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
                              Success Metric:
                            </span>
                            <p className="text-[11px] text-slate-200 bg-emerald-950/20 p-2 rounded border border-emerald-800/30">
                              {taskItem.success_metric}
                            </p>
                          </div>
                        </div>

                        {/* Red Team Risk Addressed Badge */}
                        <div className="pt-2 border-t border-border/60">
                          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                            Mitigates Red Team Risk:
                          </span>
                          <span className="px-2 py-1 rounded bg-rose-950/30 text-rose-300 text-[10px] border border-rose-800/30 block leading-tight">
                            {taskItem.risk_addressed}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DECISION GATES MATRIX */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-indigo-400" />
                    <span>DECISION GATES (STAGE-GATE EVALUATION)</span>
                  </CardTitle>
                  <CardDescription>
                    Structured checkpoints ensuring regulatory, technical, and commercial criteria are satisfied before capital commitment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actionPlannerResult.decision_gates.map((gateItem, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-100 text-sm">{gateItem.gate}</span>
                            <Badge
                              variant={
                                gateItem.status === "Ready"
                                  ? "success"
                                  : gateItem.status === "Blocked"
                                  ? "destructive"
                                  : "warning"
                              }
                            >
                              {gateItem.status.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-slate-300 text-xs font-medium leading-relaxed bg-surface-100 p-2.5 rounded-lg border border-border/60">
                            <strong>Question:</strong> {gateItem.question}
                          </p>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-semibold text-muted block">
                              Required Evidence for Gate Passage:
                            </span>
                            <ul className="space-y-1">
                              {gateItem.required_evidence.map((ev, i) => (
                                <li key={i} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                                  <CheckSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted">
                          <span>Decision Owner: <strong className="text-slate-300">{gateItem.decision_owner}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* PARTNER OUTREACH PACK */}
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span>PARTNER OUTREACH PACK (INITIAL B2B PROPOSAL)</span>
                    </CardTitle>
                    <CardDescription>
                      Tailored introductory message for shortlisted Indian System Integrator / Distributor
                    </CardDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOutreach}
                    className="text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30"
                  >
                    {copiedOutreach ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOutreach ? "Copied to Clipboard!" : "Copy Outreach Message"}</span>
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pb-2 border-b border-border/60">
                      <div>
                        <span className="text-muted block">Recipient Classification:</span>
                        <span className="font-semibold text-slate-200">{actionPlannerResult.outreach_pack.recipient_type}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Subject Line:</span>
                        <span className="font-semibold text-indigo-300">{actionPlannerResult.outreach_pack.subject}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-muted block">Message Body:</span>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 bg-surface-100 p-3 rounded-lg border border-border leading-relaxed">
                        {actionPlannerResult.outreach_pack.message}
                      </pre>
                    </div>

                    <div className="p-2.5 rounded bg-indigo-950/20 border border-indigo-800/30 flex items-center justify-between">
                      <span className="text-[11px] text-indigo-300">
                        <strong>Call to Action:</strong> {actionPlannerResult.outreach_pack.call_to_action}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TRACEABILITY & GROUNDING FOOTER */}
              <Card className="bg-surface-50/50 border-border/60">
                <CardContent className="py-4 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-indigo-400 block tracking-wider">
                    INTELLIGENCE SYNTHESIS & TRACEABILITY
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted">
                    <span className="px-2 py-1 rounded bg-surface-100 border border-border">
                      ✓ Market Fit Grounding: {marketResult?.market_fit_score || 88}/100
                    </span>
                    <span className="px-2 py-1 rounded bg-surface-100 border border-border">
                      ✓ Competitor Whitespace: {competitorResult?.market_gaps?.[0] || "SME collaborative robotics"}
                    </span>
                    <span className="px-2 py-1 rounded bg-surface-100 border border-border">
                      ✓ Top Partner: {partnerResult?.partners?.[0]?.name || "Dynamic Industrial Automation"} ({partnerResult?.partners?.[0]?.fit_score || 92}/100)
                    </span>
                    <span className="px-2 py-1 rounded bg-surface-100 border border-border">
                      ✓ Red Team Risks Mitigated: {redTeamResult?.risks?.length || 4} Critical/High Factors
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Stage 7: Executive Brief & Export (Phase 2E) */}
      {activeStage === "executive_brief" && (
        <div className="space-y-6">
          {(!analysisState || analysisState.progress < 100 || !analysisState.agent_results?.some(a => a.agent_name === "ActionPlannerAgent" && a.status === "completed")) ? (
            <Card className="py-12 text-center px-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-200">Analysis Incomplete</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Complete all 6 required intelligence stages (Brief, Market Lens, Competitor, Partner Match, Red Team, Action Plan) before generating and exporting the Executive Brief.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunPipeline}
                disabled={runningPipeline}
                className="gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Complete Intelligence Pipeline</span>
              </Button>
            </Card>
          ) : loadingExecutiveBrief ? (
            <Card className="py-16 text-center px-4 space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Synthesizing Boardroom Executive Brief...</h3>
                <p className="text-xs text-muted">
                  Aggregating multi-agent intelligence and structuring bilingual decision-support indicators.
                </p>
              </div>
            </Card>
          ) : executiveBriefError ? (
            <Card className="py-12 text-center px-4 space-y-4 border-rose-500/30">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-rose-300">Executive Brief Synthesis Failed</h3>
                <p className="text-xs text-muted max-w-md mx-auto">{executiveBriefError}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchBrief(briefLanguage)}>
                Retry Synthesis
              </Button>
            </Card>
          ) : executiveBrief && (
            <div className="space-y-6">
              {/* TOP HEADER & EXPORT ACTIONS */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface-50 border border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-950/40 text-indigo-300 border-indigo-700/40 text-[10px]">
                      BOARDROOM DELIVERABLE
                    </Badge>
                    <span className="text-xs text-muted">
                      {briefLanguage === "ja" ? "言語: 日本語" : "Language: English"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">{executiveBrief.title}</h2>
                  <p className="text-xs text-muted">
                    {briefLanguage === "ja"
                      ? "6つのエージェント分析を統合した意思決定支援レポート"
                      : "Synthesized cross-border strategic briefing across 6 intelligence agents"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* LANGUAGE SWITCHER */}
                  <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg border border-border">
                    <Button
                      size="sm"
                      variant={briefLanguage === "en" ? "primary" : "ghost"}
                      onClick={() => setBriefLanguage("en")}
                      className="text-xs h-7 px-3"
                    >
                      English
                    </Button>
                    <Button
                      size="sm"
                      variant={briefLanguage === "ja" ? "primary" : "ghost"}
                      onClick={() => setBriefLanguage("ja")}
                      className="text-xs h-7 px-3"
                    >
                      日本語
                    </Button>
                  </div>

                  {/* EXPORT BUTTONS */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getExportPdfUrl(projectId, briefLanguage), "_blank")}
                    className="text-xs gap-1.5 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/30"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getExportMarkdownUrl(projectId, briefLanguage), "_blank")}
                    className="text-xs gap-1.5 border-border text-slate-300 hover:bg-surface-100"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Markdown</span>
                  </Button>
                </div>
              </div>

              {/* METADATA BAR */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-surface-50 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted block">Enterprise</span>
                  <span className="text-xs font-semibold text-slate-200">{executiveBrief.company}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted block">Product / System</span>
                  <span className="text-xs font-semibold text-slate-200">{executiveBrief.product}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted block">Target Market</span>
                  <span className="text-xs font-semibold text-slate-200">{executiveBrief.target_market}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted block">Generated Date</span>
                  <span className="text-xs font-semibold text-slate-200">{executiveBrief.generated_at.slice(0, 10)}</span>
                </div>
              </div>

              {/* 1. EXECUTIVE SUMMARY (1-MINUTE BOARDROOM DIGEST) */}
              <Card className="border-indigo-500/30 bg-gradient-to-br from-surface-50 to-indigo-950/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2 text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>{briefLanguage === "ja" ? "1. エグゼクティブ・サマリー（要約）" : "1. EXECUTIVE SUMMARY"}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] border-indigo-700/40 text-indigo-400">
                      Multi-Agent Synthesis
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {briefLanguage === "ja"
                      ? "経営幹部向けの1分間総括概要（参入方針・市場性・リスク・90日計画）"
                      : "Concise boardroom synthesis covering entry strategy, opportunity, key risks, and 90-day milestone plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-slate-200 font-medium">
                  <p className="bg-surface-100/70 p-4 rounded-xl border border-indigo-500/20">
                    {executiveBrief.executive_summary}
                  </p>
                </CardContent>
              </Card>

              {/* 2. KEY DECISION-SUPPORT INDICATORS */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{briefLanguage === "ja" ? "2. 意思決定支援指標（KIZUNAスコア）" : "2. KEY DECISION-SUPPORT INDICATORS"}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {executiveBrief.indicators.disclaimer}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-surface-50 border border-emerald-500/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-muted">Market Fit Score</span>
                      <div className="text-2xl font-bold text-emerald-400">{executiveBrief.indicators.market_fit_score}/100</div>
                      <span className="text-[10px] text-muted block">Demand & WTP Alignment</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-50 border border-sky-500/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-muted">Partner Capability</span>
                      <div className="text-2xl font-bold text-sky-400">{executiveBrief.indicators.partner_fit_score}/100</div>
                      <span className="text-[10px] text-muted block">Integration & Distribution</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-50 border border-amber-500/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-muted">Launch Risk</span>
                      <div className="text-2xl font-bold text-amber-400">{executiveBrief.indicators.launch_risk_level}</div>
                      <span className="text-[10px] text-muted block">Composite Red Team Rating</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-50 border border-indigo-500/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-muted">Synthesis Confidence</span>
                      <div className="text-2xl font-bold text-indigo-400">{Math.round(executiveBrief.indicators.confidence_score * 100)}%</div>
                      <span className="text-[10px] text-muted block">Evidence Grounding Index</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3 & 4. MARKET OPPORTUNITY & COMPETITIVE POSITION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Compass className="w-4 h-4 text-sky-400" />
                        <span>{briefLanguage === "ja" ? "3. 市場機会および需要動向" : "3. MARKET OPPORTUNITY"}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-700/40">
                        Market Lens Agent
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-surface-50 p-3.5 rounded-lg border border-border">
                      {executiveBrief.market_opportunity}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Radar className="w-4 h-4 text-purple-400" />
                        <span>{briefLanguage === "ja" ? "4. 競合状況およびポジショニング" : "4. COMPETITIVE POSITION"}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-700/40">
                        Competitor Agent
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-surface-50 p-3.5 rounded-lg border border-border">
                      {executiveBrief.competitive_position}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* 5 & 6. PARTNER STRATEGY & RISK ASSESSMENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>{briefLanguage === "ja" ? "5. パートナー戦略" : "5. PARTNER STRATEGY"}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-700/40">
                        Partner Match Agent
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-surface-50 p-3.5 rounded-lg border border-border">
                      {executiveBrief.partner_strategy}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>{briefLanguage === "ja" ? "6. リスク評価と対抗策" : "6. RISK & RED TEAM"}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-700/40">
                        Red Team Agent
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-surface-50 p-3.5 rounded-lg border border-border">
                      {executiveBrief.risk_summary}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* 7 & 8. ENTRY STRATEGY & 90-DAY EXECUTION ROADMAP */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-400" />
                      <span>{briefLanguage === "ja" ? "7 & 8. 市場参入基本戦略および90日間実行計画" : "7 & 8. ENTRY STRATEGY & 90-DAY ROADMAP"}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-700/40">
                      Action Planner Agent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 space-y-3">
                  <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-800/30">
                    <span className="text-[10px] uppercase font-semibold text-indigo-300 block mb-1">Go-To-Market Posture</span>
                    <p className="font-medium text-slate-200">{executiveBrief.entry_strategy}</p>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs bg-surface-50 p-4 rounded-lg border border-border leading-relaxed">
                    {executiveBrief["90_day_plan"] || executiveBrief.plan_90_day}
                  </pre>
                </CardContent>
              </Card>

              {/* 9. NEXT 3 PRIORITY ACTIONS */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-indigo-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{briefLanguage === "ja" ? "9. 最優先アクション（直近3件）" : "9. NEXT 3 PRIORITY ACTIONS"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {executiveBrief.next_actions.map((act, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-surface-50 border border-border space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                            Action {idx + 1}
                          </span>
                          <p className="font-semibold text-slate-200 text-xs">{act.action}</p>
                          <p className="text-[11px] text-muted">
                            <strong className="text-slate-300">Why Now:</strong> {act.why_now}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/60 text-[10px] text-slate-400">
                          <span>Outcome: <strong className="text-emerald-400">{act.expected_outcome}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 10. DECISION GATES */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-emerald-400" />
                    <span>{briefLanguage === "ja" ? "10. 意思決定ゲート（評価基準）" : "10. DECISION GATES"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {executiveBrief.decision_gates.map((g, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-surface-50 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200">{g.gate}</span>
                          <Badge variant="warning">{g.status.toUpperCase()}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-300"><strong>Question:</strong> {g.question}</p>
                        <p className="text-[10px] text-muted">
                          Evidence: <span className="text-slate-300">{g.required_evidence.join(", ")}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 11 & 12. ASSUMPTIONS & AUDIT TRAIL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-muted" />
                      <span>{briefLanguage === "ja" ? "11. 前提条件（アサンプション）" : "11. KEY ASSUMPTIONS"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1.5">
                    {executiveBrief.key_assumptions.map((asm, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-surface-50 border border-border text-[11px] text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{asm}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      <span>{briefLanguage === "ja" ? "12. エビデンスおよび根拠資料" : "12. EVIDENCE & AUDIT TRAIL"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1.5">
                    {executiveBrief.evidence.map((item, i) => (
                      <div key={i} className="p-2 rounded bg-surface-50 border border-border space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              item.category === "SOURCE DATA"
                                ? "success"
                                : item.category === "AI INFERENCE"
                                ? "outline"
                                : "warning"
                            }
                            className="text-[9px] py-0"
                          >
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-muted">{item.source_stage}</span>
                        </div>
                        <p className="text-slate-300">{item.statement}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



