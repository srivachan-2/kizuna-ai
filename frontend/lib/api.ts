import {
  ApiHealthResponse,
  Project,
  SectorInfo,
  RegulationInfo,
  LLMStatusResponse,
  LLMTestResponse,
  AnalysisRunResponse,
  ExecutiveBriefResult
} from "@/types";
import { demoService, isDemoMode } from "./analysisService";
import { downloadMarkdownBrief, exportPrintablePdfView } from "./exportUtils";

export { isDemoMode, downloadMarkdownBrief, exportPrintablePdfView };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<ApiHealthResponse | null> {
  if (isDemoMode) {
    return demoService.checkHealth();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.checkHealth() : null;
  }
}

export async function getLLMStatus(): Promise<LLMStatusResponse | null> {
  if (isDemoMode) {
    return demoService.getLLMStatus();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/llm/status`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.getLLMStatus() : null;
  }
}

export async function testLLMConnection(): Promise<LLMTestResponse | null> {
  if (isDemoMode) {
    return demoService.testLLMConnection();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/llm/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.testLLMConnection() : null;
  }
}

export async function seedDemoProject(): Promise<{ status: string; project_id: string } | null> {
  if (isDemoMode) {
    return demoService.seedDemoProject();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/seed-demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.seedDemoProject() : null;
  }
}

export async function resetDemoProject(): Promise<{ status: string; project_id: string } | null> {
  if (isDemoMode) {
    return demoService.resetDemoProject();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/reset-demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.resetDemoProject() : null;
  }
}

export async function runAnalysis(
  analysisId: string,
  onProgress?: (state: AnalysisRunResponse) => void
): Promise<AnalysisRunResponse | null> {
  if (isDemoMode) {
    return demoService.runAnalysis(analysisId, onProgress);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Analysis execution failed");
    }
    return await res.json();
  } catch (err: any) {
    if (isDemoMode) {
      return demoService.runAnalysis(analysisId, onProgress);
    }
    console.error("runAnalysis error:", err);
    throw err;
  }
}

export async function getAnalysisResults(analysisId: string): Promise<AnalysisRunResponse | null> {
  if (isDemoMode) {
    return demoService.getAnalysisResults(analysisId);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}/results`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return isDemoMode ? demoService.getAnalysisResults(analysisId) : null;
    }
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.getAnalysisResults(analysisId) : null;
  }
}

export async function stopAnalysis(analysisId: string): Promise<{ status: string; message?: string } | null> {
  if (isDemoMode) {
    return demoService.stopAnalysis(analysisId);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    if (isDemoMode) {
      return demoService.stopAnalysis(analysisId);
    }
    console.error("stopAnalysis error:", err);
    return null;
  }
}

export async function assistProductBrief(payload: {
  target_sector: string;
  company_name_jp?: string;
  product_name?: string;
  existing_fields?: Record<string, string>;
  missing_fields?: string[];
}): Promise<{
  status: string;
  evidence_type?: string;
  suggestions: Record<string, string>;
} | null> {
  if (isDemoMode) {
    return demoService.assistProductBrief(payload);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/assist-brief`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    if (isDemoMode) {
      return demoService.assistProductBrief(payload);
    }
    console.error("assistProductBrief error:", err);
    return null;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  if (isDemoMode) {
    return demoService.fetchProjects();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      cache: "no-store",
    });
    if (!res.ok) return isDemoMode ? demoService.fetchProjects() : [];
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.fetchProjects() : [];
  }
}

export async function fetchSectors(): Promise<SectorInfo[]> {
  if (isDemoMode) {
    return demoService.fetchSectors();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/sectors`, {
      cache: "no-store",
    });
    if (!res.ok) return isDemoMode ? demoService.fetchSectors() : [];
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.fetchSectors() : [];
  }
}

export async function fetchRegulations(): Promise<RegulationInfo[]> {
  if (isDemoMode) {
    return demoService.fetchRegulations();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/regulations`, {
      cache: "no-store",
    });
    if (!res.ok) return isDemoMode ? demoService.fetchRegulations() : [];
    return await res.json();
  } catch (err) {
    return isDemoMode ? demoService.fetchRegulations() : [];
  }
}

export async function createProject(payload: {
  name: string;
  company_name_jp: string;
  target_sector: string;
  brief?: {
    product_name: string;
    value_proposition?: string;
    target_customer_profile?: string;
    pricing_model_jpy?: string;
    competitive_moat?: string;
  };
}): Promise<Project | null> {
  if (isDemoMode) {
    return demoService.createProject(payload);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    if (isDemoMode) {
      return demoService.createProject(payload);
    }
    return null;
  }
}

export async function getExecutiveBrief(analysisId: string, language: string = "en"): Promise<ExecutiveBriefResult | null> {
  if (isDemoMode) {
    return demoService.getExecutiveBrief(analysisId, language);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}/executive-brief?language=${language}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to load Executive Brief");
    }
    return await res.json();
  } catch (err: any) {
    if (isDemoMode) {
      return demoService.getExecutiveBrief(analysisId, language);
    }
    console.error("getExecutiveBrief error:", err);
    throw err;
  }
}

export function getExportPdfUrl(analysisId: string, language: string = "en"): string {
  return `${API_BASE_URL}/api/analysis/${analysisId}/export/pdf?language=${language}`;
}

export function getExportMarkdownUrl(analysisId: string, language: string = "en"): string {
  return `${API_BASE_URL}/api/analysis/${analysisId}/export/markdown?language=${language}`;
}
