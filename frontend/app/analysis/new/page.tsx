"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Layers,
  CheckCircle2,
  ArrowRight,
  Info,
  Check,
  Edit2,
  X,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createProject,
  fetchSectors,
  assistProductBrief,
  seedDemoProject,
} from "@/lib/api";
import { SectorInfo } from "@/types";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [sectors, setSectors] = useState<SectorInfo[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingAssist, setLoadingAssist] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [companyNameJp, setCompanyNameJp] = useState("");
  const [targetSector, setTargetSector] = useState("smart-manufacturing");
  const [productName, setProductName] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [pricingModelJpy, setPricingModelJpy] = useState("");
  const [competitiveMoat, setCompetitiveMoat] = useState("");

  // AI Assistance Suggestions State
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [assistNotice, setAssistNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchSectors();
      setSectors(data);
      if (data.length > 0) {
        setTargetSector(data[0].id);
      }
      setLoadingSectors(false);
    }
    load();
  }, []);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      const demo = await seedDemoProject();
      if (demo && demo.project_id) {
        router.push(`/workspace/${demo.project_id}`);
      } else {
        router.push("/workspace/demo-robot-sme");
      }
    } catch (e) {
      router.push("/workspace/demo-robot-sme");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleAIAssist = async () => {
    setLoadingAssist(true);
    setAssistNotice(null);

    // Identify which strategic fields are missing
    const missing: string[] = [];
    if (!valueProposition.trim()) missing.push("value_proposition");
    if (!pricingModelJpy.trim()) missing.push("pricing_model_jpy");
    if (!competitiveMoat.trim()) missing.push("competitive_moat");

    if (missing.length === 0) {
      setAssistNotice("All strategic fields already contain user data. User input is preserved.");
      setLoadingAssist(false);
      return;
    }

    try {
      const res = await assistProductBrief({
        target_sector: targetSector,
        company_name_jp: companyNameJp || "Japanese Enterprise",
        product_name: productName || "Industrial Solution",
        existing_fields: {
          value_proposition: valueProposition,
          pricing_model_jpy: pricingModelJpy,
          competitive_moat: competitiveMoat,
        },
        missing_fields: missing,
      });

      if (res && res.suggestions) {
        setSuggestions(res.suggestions);
        setAssistNotice("AI suggestions generated in one batched request. Review below to accept or dismiss.");
      } else {
        setAssistNotice("AI assistance generated standard sector baselines.");
      }
    } catch (err) {
      setAssistNotice("Could not reach AI assist. Default templates available.");
    } finally {
      setLoadingAssist(false);
    }
  };

  const handleAcceptSuggestion = (field: string) => {
    const text = suggestions[field];
    if (text) {
      if (field === "value_proposition") setValueProposition(text);
      if (field === "pricing_model_jpy") setPricingModelJpy(text);
      if (field === "competitive_moat") setCompetitiveMoat(text);

      const next = { ...suggestions };
      delete next[field];
      setSuggestions(next);
    }
  };

  const handleDismissSuggestion = (field: string) => {
    const next = { ...suggestions };
    delete next[field];
    setSuggestions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyNameJp || !productName) {
      alert("Please fill in the project title, Japanese enterprise name, and product name.");
      return;
    }

    setSubmitting(true);
    const result = await createProject({
      name,
      company_name_jp: companyNameJp,
      target_sector: targetSector,
      brief: {
        product_name: productName,
        value_proposition: valueProposition,
        pricing_model_jpy: pricingModelJpy,
        competitive_moat: competitiveMoat,
      },
    });

    setSubmitting(false);
    if (result && result.id) {
      router.push(`/workspace/${result.id}`);
    } else {
      router.push(`/workspace/demo`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-400">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{loadingDemo ? "Loading Demo..." : "Load Robot Demo Scenario"}</span>
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Initialize Market Entry Analysis
        </h1>
        <p className="text-sm text-muted">
          Define your Japanese product profile, target sector, and initial positioning for India-specific intelligence processing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Enterprise & Project Scope</span>
            </CardTitle>
            <CardDescription>
              Basic metadata connecting your Tokyo HQ entity with the Indian analysis run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Name / Project Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Project Sakura - India EV Expansion"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Japanese Enterprise Name (企業名) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 株式会社 日本精密 (Nippon Precision Inc.)"
                  value={companyNameJp}
                  onChange={(e) => setCompanyNameJp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Industry Sector *
              </label>
              <select
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {sectors.length > 0 ? (
                  sectors.map((sec) => (
                    <option key={sec.id} value={sec.id} className="bg-surface-100 text-slate-100">
                      {sec.name} ({sec.market_size_india_2025})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="smart-manufacturing">Smart Manufacturing & Industrial Automation</option>
                    <option value="ev-mobility">Electric Vehicles & Clean Mobility</option>
                    <option value="medtech-diagnostics">MedTech, Diagnostics & Healthcare Robotics</option>
                    <option value="enterprise-saas">B2B Enterprise Software & Supply Chain Tech</option>
                  </>
                )}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Product Brief & Value Proposition</span>
              </CardTitle>
              <CardDescription>
                Core specifications used by the AI agents to map Indian competitors, regulations, and partner fit
              </CardDescription>
            </div>

            {/* Batched AI Assistance Action */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIAssist}
              disabled={loadingAssist}
              className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 text-xs gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${loadingAssist ? "animate-spin" : ""}`} />
              <span>{loadingAssist ? "Consulting KIZUNA..." : "✨ Complete Missing Fields with KIZUNA"}</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {assistNotice && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
                <span>{assistNotice}</span>
                <button
                  type="button"
                  onClick={() => setAssistNotice(null)}
                  className="text-indigo-400 hover:text-indigo-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Product / Technology Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., K-Series High Precision IoT Sensor Suite"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Core Value Proposition & Differentiators */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  Core Value Proposition & Differentiators
                </label>
              </div>
              <p className="text-[11px] text-muted">
                Define the primary customer value and the characteristics that differentiate the offering from alternatives.
              </p>
              <textarea
                rows={3}
                placeholder="Explain why this product succeeds in Japan and the proposed advantage for India (e.g., 99.999% uptime, micro-second latency, zero-maintenance design)."
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />

              {/* AI Suggestion Card */}
              {suggestions.value_proposition && (
                <div className="p-3 rounded-lg bg-[#121828] border border-indigo-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="indigo" className="text-[10px] uppercase tracking-wider font-semibold">
                      AI SUGGESTION • AI INFERENCE
                    </Badge>
                    <span className="text-[10px] text-muted">Single-call suggestion</span>
                  </div>
                  <p className="text-slate-200 text-xs italic">
                    "{suggestions.value_proposition}"
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptSuggestion("value_proposition")}
                      className="h-7 px-2.5 text-xs gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Accept</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcceptSuggestion("value_proposition")}
                      className="h-7 px-2.5 text-xs gap-1 text-slate-300"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissSuggestion("value_proposition")}
                      className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      <span>Dismiss</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Japan Pricing */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Current Japan Pricing (JPY ¥ / Unit or Sub)
                </label>
                <p className="text-[11px] text-muted">
                  Provide the current or approximate Japan price used as the commercial baseline.
                </p>
                <input
                  type="text"
                  placeholder="e.g., ¥1,500,000 / unit (or leave blank if unpriced)"
                  value={pricingModelJpy}
                  onChange={(e) => setPricingModelJpy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />

                {/* AI Suggestion Card */}
                {suggestions.pricing_model_jpy && (
                  <div className="p-3 rounded-lg bg-[#121828] border border-indigo-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo" className="text-[10px] uppercase tracking-wider font-semibold">
                        AI SUGGESTION • AI INFERENCE
                      </Badge>
                    </div>
                    <p className="text-slate-200 text-xs italic">
                      "{suggestions.pricing_model_jpy}"
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptSuggestion("pricing_model_jpy")}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion("pricing_model_jpy")}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
                      >
                        <span>Dismiss</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Competitive Moat / IP Protection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Competitive Moat / IP Protection
                </label>
                <p className="text-[11px] text-muted">
                  Identify defensible technology, know-how, IP, process advantages, or other barriers to substitution.
                </p>
                <input
                  type="text"
                  placeholder="e.g., 14 Japanese & US Patents, proprietary firmware"
                  value={competitiveMoat}
                  onChange={(e) => setCompetitiveMoat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />

                {/* AI Suggestion Card */}
                {suggestions.competitive_moat && (
                  <div className="p-3 rounded-lg bg-[#121828] border border-indigo-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo" className="text-[10px] uppercase tracking-wider font-semibold">
                        AI SUGGESTION • AI INFERENCE
                      </Badge>
                    </div>
                    <p className="text-slate-200 text-xs italic">
                      "{suggestions.competitive_moat}"
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptSuggestion("competitive_moat")}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptSuggestion("competitive_moat")}
                        className="h-7 px-2.5 text-xs gap-1 text-slate-300"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion("competitive_moat")}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
                      >
                        <span>Dismiss</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-[#0d131f] p-4 rounded-b-xl border-t border-border">
            <span className="text-xs text-muted">
              Data is stored locally in your SQLite database. Fields can remain blank if not yet available.
            </span>
            <Button type="submit" variant="primary" size="md" disabled={submitting} className="gap-2">
              {submitting ? (
                <span>Initializing Workspace...</span>
              ) : (
                <>
                  <span>Create Workspace & Start Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
