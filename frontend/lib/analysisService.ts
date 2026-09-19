import {
  Project,
  SectorInfo,
  RegulationInfo,
  AnalysisRunResponse,
  ExecutiveBriefResult,
  LLMStatusResponse,
  LLMTestResponse,
  ApiHealthResponse,
  AgentResult
} from "@/types";

import {
  DEMO_PROJECT_ID,
  DEMO_PROJECT,
  DEMO_SECTORS,
  DEMO_REGULATIONS,
  DEMO_BRIEF_EXTRACTION,
  DEMO_MARKET_LENS,
  DEMO_COMPETITOR_MAP,
  DEMO_PARTNER_MATCH,
  DEMO_RED_TEAM,
  DEMO_ACTION_PLAN,
  DEMO_EXECUTIVE_BRIEF_EN,
  DEMO_EXECUTIVE_BRIEF_JA,
  DEMO_COMPLETED_RUN_RESPONSE
} from "@/data/demo";

// Demo mode is active if explicitly set to true OR if no backend URL is configured
export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  !process.env.NEXT_PUBLIC_API_URL;

// Client-side storage keys
const STORAGE_PROJECTS_KEY = "kizuna_demo_projects";
const STORAGE_RUNS_KEY = "kizuna_demo_runs";

// In-memory simulation state
let activeSimulationTimer: NodeJS.Timeout | null = null;
let isSimulationRunning = false;

// Initial project list
const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: DEMO_PROJECT_ID,
    name: "CR-500 India Market Entry",
    company_name_jp: "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
    target_sector: "smart-manufacturing",
    status: "completed",
    created_at: "2025-01-15T09:00:00Z"
  }
];

function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_DEMO_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_DEMO_PROJECTS));
      return INITIAL_DEMO_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEMO_PROJECTS;
  }
}

function saveStoredProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to persist demo projects:", e);
  }
}

function getStoredRun(projectId: string): AnalysisRunResponse {
  if (typeof window === "undefined") return DEMO_COMPLETED_RUN_RESPONSE;
  try {
    const raw = localStorage.getItem(`${STORAGE_RUNS_KEY}_${projectId}`);
    if (!raw) {
      // Default to completed run for standard demo scenario
      localStorage.setItem(`${STORAGE_RUNS_KEY}_${projectId}`, JSON.stringify(DEMO_COMPLETED_RUN_RESPONSE));
      return DEMO_COMPLETED_RUN_RESPONSE;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEMO_COMPLETED_RUN_RESPONSE;
  }
}

function saveStoredRun(projectId: string, run: AnalysisRunResponse) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_RUNS_KEY}_${projectId}`, JSON.stringify(run));
  } catch (e) {
    console.error("Failed to persist demo run:", e);
  }
}

// --------------------------------------------------------------------------
// DEMO SERVICE METHODS (100% Client-Side & Zero-Backend)
// --------------------------------------------------------------------------

export const demoService = {
  checkHealth(): ApiHealthResponse {
    return {
      status: "healthy",
      service: "KIZUNA AI Frontend Showcase",
      version: "2.0.0-demo",
      database: "Client-Side In-Memory Cache",
      llm_provider: "Curated Benchmark Scenario Engine",
      mode: "showcase_demo"
    };
  },

  getLLMStatus(): LLMStatusResponse {
    return {
      provider: "Google Gemini (Showcase Architecture)",
      model: "gemini-1.5-flash",
      configured: true,
      status: "connected",
      mode: "mock_mode"
    };
  },

  async testLLMConnection(): Promise<LLMTestResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      provider: "Google Gemini",
      model: "gemini-1.5-flash",
      status: "Verified (Portfolio Showcase)",
      message: "Handshake verified through KIZUNA AI multi-agent orchestration architecture.",
      sample_output: "KIZUNA bilateral analysis engine initialized for Japanese SME robotics expansion in India."
    };
  },

  fetchProjects(): Project[] {
    return getStoredProjects();
  },

  fetchSectors(): SectorInfo[] {
    return DEMO_SECTORS;
  },

  fetchRegulations(): RegulationInfo[] {
    return DEMO_REGULATIONS;
  },

  createProject(payload: {
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
  }): Project {
    const newId = `project-${Date.now().toString(36)}`;
    const newProject: Project = {
      id: newId,
      name: payload.name || "Custom Japan-India Entry Plan",
      company_name_jp: payload.company_name_jp || "日本企業",
      target_sector: payload.target_sector || "smart-manufacturing",
      status: "draft",
      created_at: new Date().toISOString()
    };

    const current = getStoredProjects();
    const updated = [newProject, ...current];
    saveStoredProjects(updated);

    // Initialize blank run state for this new project
    const initialRun: AnalysisRunResponse = {
      analysis_run_id: `run-${newId}`,
      project_id: newId,
      stage: "brief",
      status: "pending",
      current_agent: "BriefExtractorAgent",
      progress: 0,
      agent_results: []
    };
    saveStoredRun(newId, initialRun);

    return newProject;
  },

  seedDemoProject(): { status: string; project_id: string } {
    const projects = getStoredProjects();
    if (!projects.some((p) => p.id === DEMO_PROJECT_ID)) {
      saveStoredProjects([DEMO_PROJECT, ...projects]);
    }
    return { status: "success", project_id: DEMO_PROJECT_ID };
  },

  resetDemoProject(): { status: string; project_id: string } {
    if (activeSimulationTimer) {
      clearTimeout(activeSimulationTimer);
      activeSimulationTimer = null;
    }
    isSimulationRunning = false;

    // Reset run back to initial draft state (0% progress)
    const initialDraftRun: AnalysisRunResponse = {
      analysis_run_id: "demo-run-cr500-draft",
      project_id: DEMO_PROJECT_ID,
      stage: "brief",
      status: "pending",
      current_agent: "BriefExtractorAgent",
      progress: 0,
      agent_results: []
    };
    saveStoredRun(DEMO_PROJECT_ID, initialDraftRun);

    // Update project status in project list
    const projects = getStoredProjects();
    const updatedProjects = projects.map((p) =>
      p.id === DEMO_PROJECT_ID ? { ...p, status: "draft" as const } : p
    );
    saveStoredProjects(updatedProjects);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kizuna:pipeline-update", { detail: initialDraftRun })
      );
    }

    return { status: "reset_complete", project_id: DEMO_PROJECT_ID };
  },

  getAnalysisResults(projectId: string): AnalysisRunResponse {
    const targetId = (projectId === "demo" || projectId === "demo-robot-sme") ? DEMO_PROJECT_ID : projectId;
    return getStoredRun(targetId);
  },

  stopAnalysis(projectId: string): { status: string; message: string } {
    if (activeSimulationTimer) {
      clearTimeout(activeSimulationTimer);
      activeSimulationTimer = null;
    }
    isSimulationRunning = false;

    const targetId = (projectId === "demo" || projectId === "demo-robot-sme") ? DEMO_PROJECT_ID : projectId;
    const currentRun = getStoredRun(targetId);
    const cancelledRun: AnalysisRunResponse = {
      ...currentRun,
      status: "cancelled"
    };
    saveStoredRun(targetId, cancelledRun);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kizuna:pipeline-update", { detail: cancelledRun })
      );
    }

    return { status: "cancelled", message: "Analysis pipeline cancelled successfully." };
  },

  async runAnalysis(
    projectId: string,
    onProgress?: (state: AnalysisRunResponse) => void
  ): Promise<AnalysisRunResponse> {
    const targetId = (projectId === "demo" || projectId === "demo-robot-sme") ? DEMO_PROJECT_ID : projectId;
    
    if (isSimulationRunning) {
      return getStoredRun(targetId);
    }

    isSimulationRunning = true;

    // The 6 sequential agents to simulate
    const stages: {
      agentName: string;
      stageName: string;
      progress: number;
      delayMs: number;
      output: any;
      resultKey: string;
    }[] = [
      {
        agentName: "BriefExtractorAgent",
        stageName: "brief",
        progress: 16,
        delayMs: 700,
        output: DEMO_BRIEF_EXTRACTION,
        resultKey: "brief"
      },
      {
        agentName: "MarketLensAgent",
        stageName: "market_lens",
        progress: 33,
        delayMs: 800,
        output: DEMO_MARKET_LENS,
        resultKey: "market_lens"
      },
      {
        agentName: "CompetitorAgent",
        stageName: "competitor_map",
        progress: 50,
        delayMs: 750,
        output: DEMO_COMPETITOR_MAP,
        resultKey: "competitor_map"
      },
      {
        agentName: "PartnerMatchAgent",
        stageName: "partner_match",
        progress: 66,
        delayMs: 850,
        output: DEMO_PARTNER_MATCH,
        resultKey: "partner_match"
      },
      {
        agentName: "RedTeamAgent",
        stageName: "red_team",
        progress: 83,
        delayMs: 800,
        output: DEMO_RED_TEAM,
        resultKey: "red_team"
      },
      {
        agentName: "ActionPlannerAgent",
        stageName: "launch_plan",
        progress: 100,
        delayMs: 750,
        output: DEMO_ACTION_PLAN,
        resultKey: "action_plan"
      }
    ];

    const accumulatedAgentResults: AgentResult[] = [];
    const accumulatedResultData: Record<string, any> = {};

    // Initial running state
    let currentState: AnalysisRunResponse = {
      analysis_run_id: `run-${Date.now()}`,
      project_id: targetId,
      stage: "brief",
      status: "running",
      current_agent: "BriefExtractorAgent",
      progress: 5,
      agent_results: [],
      result_data: {}
    };

    saveStoredRun(targetId, currentState);
    onProgress?.(currentState);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kizuna:pipeline-update", { detail: currentState })
      );
    }

    for (let i = 0; i < stages.length; i++) {
      if (!isSimulationRunning) break;

      const stage = stages[i];

      // Update current active agent state
      currentState = {
        ...currentState,
        status: "running",
        current_agent: stage.agentName,
        stage: stage.stageName,
        progress: Math.max(5, stage.progress - 8)
      };
      saveStoredRun(targetId, currentState);
      onProgress?.(currentState);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kizuna:pipeline-update", { detail: currentState })
        );
      }

      // Realistic processing delay
      await new Promise((resolve) => {
        activeSimulationTimer = setTimeout(resolve, stage.delayMs);
      });

      if (!isSimulationRunning) break;

      // Add completed agent result
      accumulatedAgentResults.push({
        id: `res-${stage.agentName}-${Date.now()}`,
        agent_name: stage.agentName,
        status: "completed",
        confidence: stage.output.confidence || 0.92,
        output: stage.output,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });
      accumulatedResultData[stage.resultKey] = stage.output;

      currentState = {
        ...currentState,
        status: i === stages.length - 1 ? "completed" : "running",
        current_agent: i === stages.length - 1 ? "ActionPlannerAgent" : stages[i + 1].agentName,
        progress: stage.progress,
        stage: stage.stageName,
        agent_results: [...accumulatedAgentResults],
        result_data: { ...accumulatedResultData }
      };

      saveStoredRun(targetId, currentState);
      onProgress?.(currentState);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kizuna:pipeline-update", { detail: currentState })
        );
      }
    }

    isSimulationRunning = false;
    activeSimulationTimer = null;

    // Mark project as completed in project list
    const projects = getStoredProjects();
    const updatedProjects = projects.map((p) =>
      p.id === targetId ? { ...p, status: "completed" as const } : p
    );
    saveStoredProjects(updatedProjects);

    return currentState;
  },

  getExecutiveBrief(projectId: string, language: string = "en"): ExecutiveBriefResult {
    return language === "ja" ? DEMO_EXECUTIVE_BRIEF_JA : DEMO_EXECUTIVE_BRIEF_EN;
  },

  assistProductBrief(payload: {
    target_sector: string;
    company_name_jp?: string;
    product_name?: string;
    existing_fields?: Record<string, string>;
    missing_fields?: string[];
  }): {
    status: string;
    evidence_type: string;
    suggestions: Record<string, string>;
  } {
    const suggestions: Record<string, string> = {
      value_proposition:
        "High-precision 6-axis collaborative automation designed for electronics PCB testing and SME CNC tending with 40% lower power draw.",
      pricing_model_jpy: "₹12-15 Lakhs (Equivalent: ¥2.2M - ¥2.8M JPY) turnkey pilot deployment",
      competitive_moat:
        "Sub-millimeter optical torque sensing and pre-integrated bilingual ROS2 controller interfaces tailored for high-mix low-volume production."
    };

    return {
      status: "success",
      evidence_type: "SECTOR_BENCHMARK",
      suggestions
    };
  }
};
