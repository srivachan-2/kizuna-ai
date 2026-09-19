"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { fetchProjects, fetchSectors, seedDemoProject } from "@/lib/api";
import { Project, SectorInfo } from "@/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<SectorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [projData, sectorData] = await Promise.all([
        fetchProjects(),
        fetchSectors(),
      ]);
      setProjects(projData);
      setSectors(sectorData);
      setLoading(false);
    }
    loadData();
  }, []);

  const isTestProject = (proj: Project) => {
    if (proj.id === "demo-robot-sme" || proj.id === "demo") return false;
    const name = (proj.name || "").toLowerCase().trim();
    const company = (proj.company_name_jp || "").toLowerCase().trim();
    if (
      name.startsWith("test") ||
      name.includes("phase 2") ||
      name.includes("failure test") ||
      name.includes("pipeline test") ||
      name.includes("incomplete") ||
      name.includes("verification") ||
      company.startsWith("test")
    ) {
      return true;
    }
    return false;
  };

  const legitimateProjects = projects.filter((p) => !isTestProject(p));
  const displayedProjects = showAllProjects
    ? legitimateProjects
    : legitimateProjects.slice(0, 3);

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      const demo = await seedDemoProject();
      if (demo && demo.project_id) {
        router.push(`/workspace/${demo.project_id}`);
      } else {
        router.push("/workspace/demo");
      }
    } catch (e) {
      router.push("/workspace/demo");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b2b] via-[#101726] to-[#181a29] border border-border p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>日印市場参入インテリジェンス • Bilateral Market Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              India Market Entry Intelligence
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Autonomous, data-grounded intelligence pipelines designed for Japanese enterprises evaluating market viability, competitive dynamics, regulatory landscapes, and joint-venture partnerships in India.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleLaunchDemo}
              disabled={loadingDemo}
              className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{loadingDemo ? "Loading Demo..." : "Launch Demo Scenario"}</span>
            </Button>
            <Link href="/analysis/new">
              <Button variant="primary" size="md" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>Start New Analysis</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Corridor Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Entry Pipelines"
          value={legitimateProjects.length.toString()}
          change="+100%"
          changeType="positive"
          subtitle="Enterprise projects initialized"
          icon={<Building2 className="w-5 h-5 text-indigo-400" />}
        />
        <MetricCard
          title="High-Growth Sectors"
          value={sectors.length > 0 ? sectors.length.toString() : "4"}
          subtitle="Curated bilateral domains"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Regulatory Frameworks"
          value="3"
          subtitle="DPDP, BIS, & FDI Automatic"
          icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Agentic Workflow Stages"
          value="7"
          subtitle="Brief to 90-Day Execution"
          icon={<Zap className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      {/* Main Grid: Projects & Curated Sector Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Analysis Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Market Entry Analyses</CardTitle>
                <CardDescription>
                  Enterprise projects evaluating specific Japanese products in India
                </CardDescription>
              </div>
              <Link href="/analysis/new">
                <Button variant="secondary" size="sm">
                  New Project
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-xs text-muted">
                  Loading analysis workspaces...
                </div>
              ) : legitimateProjects.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 border border-border flex items-center justify-center text-muted">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">No active entry analysis created yet</p>
                    <p className="text-xs text-muted">Begin by submitting a product brief or choosing a sector.</p>
                  </div>
                  <Link href="/analysis/new" className="inline-block mt-2">
                    <Button variant="primary" size="sm" className="gap-2">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create First Entry Brief</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-border/60">
                    {displayedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="py-3.5 flex items-center justify-between hover:bg-surface-50/50 px-2 rounded-lg transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{proj.name}</span>
                            <span className="text-xs text-muted">({proj.company_name_jp})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Badge variant="indigo">{proj.target_sector}</Badge>
                            <span>•</span>
                            <span>ID: {proj.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusPill status={proj.status} />
                          <Link href={`/workspace/${proj.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <span>Open</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {legitimateProjects.length > 3 && (
                    <div className="pt-2 border-t border-border/50 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20"
                      >
                        {showAllProjects
                          ? "Show Less ↑"
                          : `Show More (${legitimateProjects.length - 3} more) ↓`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Pipeline Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>End-to-End Market Entry Pipeline</span>
              </CardTitle>
              <CardDescription>
                Systematic bilateral strategy workflow from product brief to exportable execution brief
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>1. Product Brief & Moat</span>
                    <Badge variant="default">Stage 1</Badge>
                  </div>
                  <p className="text-muted">Extracts core Japanese specifications, unit economics, and value proposition.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>2. Market Lens & TAM</span>
                    <Badge variant="default">Stage 2</Badge>
                  </div>
                  <p className="text-muted">Calculates addressable Indian market sizes, growth drivers, and regional clusters.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>3. Competitor Intelligence</span>
                    <Badge variant="default">Stage 3</Badge>
                  </div>
                  <p className="text-muted">Maps domestic Indian challengers, global incumbents, and price-performance gaps.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>4. Partner Match & JV</span>
                    <Badge variant="default">Stage 4</Badge>
                  </div>
                  <p className="text-muted">Identifies tier-1 distributors, system integrators, and joint-venture candidates.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>5. Red-Team & Risk Engine</span>
                    <Badge variant="default">Stage 5</Badge>
                  </div>
                  <p className="text-muted">Stress-tests regulatory compliance, supply chain snarls, and pricing resistance.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>6. 90-Day Plan & Export</span>
                    <Badge variant="default">Stage 6-7</Badge>
                  </div>
                  <p className="text-muted">Generates milestone roadmap with executive board presentation export.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Curated Sector Spotlights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bilateral Sector Spotlights</CardTitle>
              <CardDescription>Curated high-growth domains for Japanese market entrants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectors.map((sec) => (
                <div key={sec.id} className="p-3 rounded-lg bg-surface-50 border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-slate-200">{sec.name}</span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                      CAGR {sec.cagr}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-2">
                    {sec.key_opportunities[0]}
                  </p>
                  <div className="text-[10px] text-indigo-300 font-mono">
                    Est. Market: {sec.market_size_india_2025}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
