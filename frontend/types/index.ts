export type SectorId = 'ev-mobility' | 'smart-manufacturing' | 'medtech-diagnostics' | 'enterprise-saas';

export interface SectorInfo {
  id: SectorId;
  name: string;
  market_size_india_2025: string;
  cagr: string;
  key_opportunities: string[];
  regulatory_body: string;
  bilateral_initiatives: string;
}

export interface RegulationInfo {
  id: string;
  name: string;
  impact_level: 'Critical' | 'High' | 'Medium' | 'Favorable';
  applicable_sectors: string[];
  summary: string;
  japanese_corporate_guidance: string;
}

// Stage 1: Brief Extraction
export interface BriefExtractionResult {
  product_name: string;
  product_category: string;
  product_description: string;
  company_name: string;
  origin_country: string;
  target_market: string;
  target_customer: string;
  price_range?: string;
  launch_timeline?: string;
  target_regions: string[];
  business_model?: string;
  constraints: string[];
  key_requirements: string[];
  assumptions: string[];
  confidence: number;
}

// Stage 2: Market Lens
export interface RegionEvaluation {
  region: string;
  relevance: string;
  reasoning: string;
  confidence: number;
}

export interface MarketLensResult {
  market_summary: string;
  target_segments: string[];
  customer_needs: string[];
  demand_signals: string[];
  opportunities: string[];
  market_entry_considerations: string[];
  priority_regions: RegionEvaluation[];
  positioning: string;
  market_fit_score: number;
  confidence: number;
  evidence: string[];
  assumptions: string[];
}

// Stage 3: Competitor Intelligence
export interface CompetitorProfile {
  name: string;
  type: 'domestic' | 'global' | 'regional';
  product_category: string;
  target_segment: string;
  positioning: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  visible_gap: string;
  source?: string;
  confidence: number;
}

export interface CompetitorAnalysisResult {
  competitive_summary: string;
  competitors: CompetitorProfile[];
  market_gaps: string[];
  positioning_opportunities: string[];
  confidence: number;
  evidence: string[];
  assumptions: string[];
}

// Stage 4: Partner Matching
export interface PartnerProfile {
  name: string;
  partner_type: string;
  fit_score: number;
  market_fit: number;
  industry_fit: number;
  technical_fit: number;
  geographic_fit: number;
  distribution_fit: number;
  pilot_fit: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  recommended_role: string;
  source?: string;
  confidence: number;
}

export interface PartnerMatchResult {
  summary: string;
  partners: PartnerProfile[];
  selection_criteria: string[];
  market_entry_strategy: string;
  confidence: number;
  evidence: string[];
  assumptions: string[];
}

// Stage 5: Risk & Red Team
export interface RiskItem {
  category: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence: string[];
  assumption: string;
  mitigation: string;
}

export interface RedTeamResult {
  overall_risk: 'Low' | 'Medium' | 'High' | 'Critical';
  challenge_summary: string;
  risks: RiskItem[];
  weak_assumptions: string[];
  recommendation_challenges: string[];
  mitigations: string[];
  confidence: number;
  evidence: string[];
}

// Stage 6: Action Planner
export interface ActionTask {
  task: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  dependency: string;
  expected_outcome: string;
  success_metric: string;
  risk_addressed: string;
}

export interface DecisionGate {
  gate: string;
  question: string;
  required_evidence: string[];
  decision_owner: string;
  status: 'Open' | 'Ready' | 'Blocked';
}

export interface PriorityAction {
  action: string;
  why_now: string;
  expected_outcome: string;
  dependency: string;
}

export interface OutreachPack {
  recipient_type: string;
  subject: string;
  message: string;
  call_to_action: string;
}

export interface ActionPlannerResult {
  executive_recommendation: string;
  entry_strategy: string;
  priority_actions: PriorityAction[];
  days_1_30: ActionTask[];
  days_31_60: ActionTask[];
  days_61_90: ActionTask[];
  key_dependencies: string[];
  success_metrics: string[];
  decision_gates: DecisionGate[];
  outreach_pack: OutreachPack;
  confidence: number;
  evidence: string[];
  assumptions: string[];
}

export interface AgentResult {
  id: string;
  agent_name: string;
  status: 'running' | 'completed' | 'failed';
  input_summary?: string;
  output?: BriefExtractionResult | MarketLensResult | CompetitorAnalysisResult | PartnerMatchResult | RedTeamResult | ActionPlannerResult | Record<string, any>;
  confidence?: number;
  error_message?: string;
  created_at?: string;
  completed_at?: string;
}

export interface AnalysisRunResponse {
  analysis_run_id?: string;
  project_id: string;
  stage: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'not_found';
  current_agent?: string;
  progress: number;
  result_data?: Record<string, any>;
  agent_results: AgentResult[];
}

export interface ProjectBrief {
  product_name: string;
  value_proposition?: string;
  target_customer_profile?: string;
  pricing_model_jpy?: string;
  competitive_moat?: string;
}

export interface Project {
  id: string;
  name: string;
  company_name_jp: string;
  target_sector: string;
  status: 'draft' | 'analyzing' | 'completed' | 'cancelled' | 'failed';
  created_at?: string;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  version: string;
  database: string;
  llm_provider: string;
  mode: string;
}

export interface LLMStatusResponse {
  provider: string;
  model: string;
  configured: boolean;
  status: 'connected' | 'not_configured' | 'active' | 'error';
  mode: 'gemini_live' | 'mock_mode';
}

export interface LLMTestResponse {
  success: boolean;
  provider: string;
  model: string;
  status: string;
  message: string;
  sample_output?: string;
}

// Stage 7 / Export: Executive Brief
export interface EvidenceClassificationItem {
  category: 'SOURCE DATA' | 'AI INFERENCE' | 'ASSUMPTION';
  statement: string;
  source_stage: string;
}

export interface KeyDecisionIndicators {
  market_fit_score: number;
  partner_fit_score: number;
  launch_risk_level: string;
  confidence_score: number;
  disclaimer: string;
}

export interface ExecutiveBriefResult {
  title: string;
  company: string;
  product: string;
  target_market: string;
  executive_summary: string;
  market_opportunity: string;
  competitive_position: string;
  partner_strategy: string;
  risk_summary: string;
  entry_strategy: string;
  '90_day_plan'?: string;
  plan_90_day?: string;
  next_actions: PriorityAction[];
  decision_gates: DecisionGate[];
  key_assumptions: string[];
  evidence: EvidenceClassificationItem[];
  indicators: KeyDecisionIndicators;
  confidence: number;
  language: 'en' | 'ja';
  generated_at: string;
}

export type AnalysisStage = 
  | 'brief'
  | 'market_lens'
  | 'competitor_map'
  | 'partner_match'
  | 'red_team'
  | 'launch_plan'
  | 'executive_brief';

