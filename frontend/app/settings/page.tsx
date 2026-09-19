"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Terminal,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { getLLMStatus, testLLMConnection } from "@/lib/api";
import { LLMStatusResponse, LLMTestResponse } from "@/types";

export default function SettingsPage() {
  const [llmStatus, setLlmStatus] = useState<LLMStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<LLMTestResponse | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await getLLMStatus();
    setLlmStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testLLMConnection();
    setTestResult(res);
    setTesting(false);
    fetchStatus();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>Intelligence Engine Architecture</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          AI Provider & Model Settings
        </h1>
        <p className="text-sm text-muted">
          KIZUNA AI uses Google Gemini as its primary intelligence engine. View active model routing, verify API connectivity, and review credential isolation standards.
        </p>
      </div>

      {/* Main LLM Configuration Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Official AI Provider: Google Gemini</span>
            </CardTitle>
            <CardDescription>
              Backend-managed LLM service for bilateral reasoning, competitor mapping, and risk stress-testing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-1">
              <span className="text-[11px] text-muted uppercase font-mono tracking-wider block">AI Provider</span>
              <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                {llmStatus ? llmStatus.provider : "Google Gemini"}
              </span>
              <span className="text-[10px] text-emerald-400">Primary Bilateral Engine</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-1">
              <span className="text-[11px] text-muted uppercase font-mono tracking-wider block">Configured Model</span>
              <span className="text-sm font-mono font-bold text-indigo-300">
                {llmStatus ? llmStatus.model : "Loading..."}
              </span>
              <span className="text-[10px] text-muted">Set via GEMINI_MODEL</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-border/80 space-y-1">
              <span className="text-[11px] text-muted uppercase font-mono tracking-wider block">Connection Status</span>
              <div className="pt-0.5">
                {loading ? (
                  <span className="text-xs text-muted">Checking...</span>
                ) : llmStatus?.configured && llmStatus.status === "connected" ? (
                  <Badge variant="success" className="gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Connected (Live)</span>
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Mock Mode (Local)</span>
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted">
                {llmStatus?.configured ? "Live Gemini Generation" : "Offline Simulation"}
              </span>
            </div>
          </div>

          {/* Key Security Notice */}
          <div className="p-4 rounded-xl bg-surface-50/70 border border-border/70 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-200">Zero Credential Exposure Guarantee</span>
              <p className="text-muted leading-relaxed">
                API keys are loaded strictly by the Python FastAPI backend via the <code className="text-indigo-300 bg-surface-100 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> environment variable. Credentials are never sent to the browser, logged, or exposed in any API response.
              </p>
            </div>
          </div>

          {/* Test Connection Action & Output */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0e1422] border border-border">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Verify Gemini Connection</span>
                <span className="text-[11px] text-muted">
                  Runs a non-destructive handshake test through the backend GeminiProvider abstraction.
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing}
                className="gap-2 shrink-0"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Test Connection</span>
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl text-xs space-y-2 border ${
                  testResult.success
                    ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                    : "bg-amber-950/20 border-amber-800/40 text-amber-300"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Status: {testResult.status}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Model: {testResult.model}</span>
                </div>
                <p className="text-slate-300">{testResult.message}</p>
                {testResult.sample_output && (
                  <div className="mt-2 p-2.5 rounded bg-surface-100 border border-border/80 font-mono text-[11px] text-slate-200">
                    Response: {testResult.sample_output}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Quick Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span>Environment Setup Reference</span>
          </CardTitle>
          <CardDescription>
            Configure your local backend <code className="text-indigo-300">.env</code> to activate live Gemini reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3.5 rounded-lg bg-[#0a0e16] border border-border font-mono text-xs text-slate-300 space-y-1">
            <div className="text-muted-foreground"># In kizuna-ai/backend/.env:</div>
            <div className="text-emerald-400">LLM_PROVIDER=gemini</div>
            <div className="text-indigo-300">GEMINI_API_KEY=AIzaSy...</div>
            <div className="text-amber-300">GEMINI_MODEL=gemini-1.5-flash</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
