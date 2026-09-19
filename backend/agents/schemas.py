from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# Brief Extraction Schemas (Stage 1)
# -------------------------------------------------------------
class BriefExtractionResult(BaseModel):
    product_name: str = Field(..., description="Name of the product or system")
    product_category: str = Field(..., description="Industry category e.g. Industrial Robotics, MedTech, IoT")
    product_description: str = Field(..., description="Concise summary of what the product does")
    company_name: str = Field(..., description="Name of the Japanese enterprise/manufacturer")
    origin_country: str = Field(default="Japan", description="Country of origin")
    target_market: str = Field(..., description="Target Indian market segment")
    target_customer: str = Field(..., description="Ideal customer profile e.g. Indian Tier-2 Auto Component Manufacturers")
    price_range: Optional[str] = Field(default="Not specified", description="Pricing tier or JPY/INR range")
    launch_timeline: Optional[str] = Field(default="Not specified", description="Target launch timeline or pilot window")
    target_regions: List[str] = Field(default_factory=list, description="Target Indian industrial corridors/states")
    business_model: Optional[str] = Field(default="Direct Import / Joint Venture", description="Go-to-market business model")
    constraints: List[str] = Field(default_factory=list, description="Known regulatory, technical or operational constraints")
    key_requirements: List[str] = Field(default_factory=list, description="Key technical or commercial prerequisites")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made where information was implicit")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")


# -------------------------------------------------------------
# Market Lens Schemas (Stage 2)
# -------------------------------------------------------------
class RegionEvaluation(BaseModel):
    region: str = Field(..., description="Name of the Indian state or industrial cluster (e.g. Tamil Nadu, Gujarat, Delhi-NCR, Bengaluru / Karnataka)")
    relevance: str = Field(default="High", description="High, Medium, or Emerging relevance rating")
    reasoning: str = Field(default="Key industrial cluster with established supply chain presence.", description="Rationale for relevance")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")

class MarketLensResult(BaseModel):
    market_summary: str = Field(
        default="High-growth opportunity in the Indian manufacturing and automation corridor.",
        description="Executive summary of market entry opportunity"
    )
    target_segments: List[str] = Field(default_factory=list, description="Identified sub-segments in India")
    customer_needs: List[str] = Field(default_factory=list, description="Primary pain points and requirements of Indian customers")
    demand_signals: List[str] = Field(default_factory=list, description="Macro drivers and policy tailwinds in India")
    opportunities: List[str] = Field(default_factory=list, description="Actionable bilateral entry opportunities")
    market_entry_considerations: List[str] = Field(default_factory=list, description="Key regulatory, distribution, and operational hurdles")
    priority_regions: List[RegionEvaluation] = Field(default_factory=list, description="Evaluated Indian regional clusters")
    positioning: str = Field(
        default="Precision Japanese engineering tailored for Indian SME automation requirements.",
        description="Recommended strategic value proposition for India"
    )
    market_fit_score: int = Field(default=80, ge=0, le=100, description="AI-generated decision support market fit score (0-100)")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")
    evidence: List[str] = Field(default_factory=list, description="Direct facts extracted from curated datasets (SOURCE DATA)")
    assumptions: List[str] = Field(default_factory=list, description="Inferences and assumptions made where data was implicit (AI INFERENCE / ASSUMPTION)")


# -------------------------------------------------------------
# Competitor Intelligence Schemas (Stage 3)
# -------------------------------------------------------------
class CompetitorProfile(BaseModel):
    name: str = Field(..., description="Competitor company or solution name")
    type: Literal["domestic", "global", "regional"] = Field(default="domestic", description="Category: domestic, global, or regional")
    product_category: str = Field(default="Automation & Robotics", description="Product category offered")
    target_segment: str = Field(default="Indian Manufacturers", description="Primary customer segment targeted")
    positioning: str = Field(default="Established market presence", description="Market positioning strategy")
    pricing: str = Field(default="Market benchmark", description="Pricing benchmark or comparison tier")
    strengths: List[str] = Field(default_factory=list, description="Key competitive strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Vulnerabilities and shortcomings")
    visible_gap: str = Field(default="Market gap unaddressed by competitor.", description="Market gap or vulnerability the Japanese entrant can exploit")
    source: str = Field(default="Curated dataset", description="Data source reference")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")

class CompetitorAnalysisResult(BaseModel):
    competitive_summary: str = Field(
        default="Competitive landscape shows bifurcation between high-cost global incumbents and low-precision domestic retrofits.",
        description="Overall competitive landscape assessment"
    )
    competitors: List[CompetitorProfile] = Field(default_factory=list, description="List of mapped competitors")
    market_gaps: List[str] = Field(default_factory=list, description="Unaddressed market whitespaces")
    positioning_opportunities: List[str] = Field(default_factory=list, description="Strategic positioning angles for the Japanese entrant")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")
    evidence: List[str] = Field(default_factory=list, description="Facts drawn from curated registries (SOURCE DATA)")
    assumptions: List[str] = Field(default_factory=list, description="Competitive inferences made by the model (AI INFERENCE)")


# -------------------------------------------------------------
# Partner Matching Schemas (Stage 4)
# -------------------------------------------------------------
class PartnerProfile(BaseModel):
    name: str = Field(..., description="Partner company name")
    partner_type: str = Field(default="System Integrator", description="Distributor | System Integrator | Technology Partner | Pilot Partner | Joint Venture Candidate")
    fit_score: int = Field(default=0, ge=0, le=100, description="Total deterministic fit score (0-100)")
    market_fit: int = Field(default=0, ge=0, le=25, description="Market Fit score component (max 25)")
    industry_fit: int = Field(default=0, ge=0, le=20, description="Industry Fit score component (max 20)")
    technical_fit: int = Field(default=0, ge=0, le=20, description="Technical Fit score component (max 20)")
    geographic_fit: int = Field(default=0, ge=0, le=15, description="Geographic Fit score component (max 15)")
    distribution_fit: int = Field(default=0, ge=0, le=10, description="Distribution Capability component (max 10)")
    pilot_fit: int = Field(default=0, ge=0, le=10, description="Pilot Capability component (max 10)")
    reasoning: str = Field(default="Strong regional presence and complementary technical stack.", description="Gemini-generated explanation of partner fit")
    strengths: List[str] = Field(default_factory=list, description="Identified partner strengths")
    concerns: List[str] = Field(default_factory=list, description="Identified partner risks or operational gaps")
    recommended_role: str = Field(default="Primary System Integrator", description="Recommended strategic role")
    source: str = Field(default="Curated demo dataset", description="Data source reference (SOURCE DATA)")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")

class PartnerMatchResult(BaseModel):
    summary: str = Field(
        default="Identified qualified Indian distribution and integration partners with high regional synergy.",
        description="Executive summary of partner landscape"
    )
    partners: List[PartnerProfile] = Field(default_factory=list, description="Evaluated partner list")
    selection_criteria: List[str] = Field(
        default_factory=lambda: [
            "Market Fit (25%): Alignment with Indian SME target segments",
            "Industry Fit (20%): Industrial automation and precision manufacturing experience",
            "Technical Fit (20%): Robotics, PLC, and optical/torque sensing capabilities",
            "Geographic Fit (15%): Presence in Tamil Nadu, Gujarat, NCR, Karnataka clusters",
            "Distribution Fit (10%): Direct INR billing and dealer network reach",
            "Pilot Capability (10%): Dedicated PoC demo lab facilities"
        ],
        description="Transparent scoring criteria"
    )
    market_entry_strategy: str = Field(
        default="Dual-track entry combining a primary System Integrator for technical PoCs with a master Distributor for INR invoicing.",
        description="Recommended partner structure"
    )
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")
    evidence: List[str] = Field(default_factory=list, description="Curated dataset references (SOURCE DATA)")
    assumptions: List[str] = Field(default_factory=list, description="Strategic partner assumptions (ASSUMPTIONS)")


# -------------------------------------------------------------
# Risk & Red Team Schemas (Stage 5)
# -------------------------------------------------------------
class RiskItem(BaseModel):
    category: str = Field(..., description="Regulatory | Market | Competition | Pricing | Distribution | Technical | Localization | After-sales/service | Supply Chain | Foreign Exchange")
    title: str = Field(..., description="Concise risk title")
    description: str = Field(..., description="Detailed description of failure mode")
    likelihood: int = Field(default=2, ge=1, le=5, description="Likelihood score (1-5)")
    impact: int = Field(default=3, ge=1, le=5, description="Impact score (1-5)")
    risk_score: int = Field(default=6, ge=1, le=25, description="Deterministic likelihood × impact (1-25)")
    severity: Literal["Low", "Medium", "High", "Critical"] = Field(default="Medium", description="Severity band: Low (1-4), Medium (5-9), High (10-15), Critical (16-25)")
    evidence: List[str] = Field(default_factory=list, description="Ground truth references (SOURCE DATA)")
    assumption: str = Field(default="Assumes existing competitor pricing stays constant", description="Challenged underlying assumption")
    mitigation: str = Field(default="Proactive mitigation strategy", description="Recommended mitigation step")

class RedTeamResult(BaseModel):
    overall_risk: Literal["Low", "Medium", "High", "Critical"] = Field(default="Medium", description="Composite risk level")
    challenge_summary: str = Field(
        default="Red Team analysis highlights key exposure in local field support availability, BIS certification timelines, and INR currency volatility.",
        description="Executive summary of critical challenges"
    )
    risks: List[RiskItem] = Field(default_factory=list, description="Categorized risk matrix")
    weak_assumptions: List[str] = Field(default_factory=list, description="Fragile or unverified assumptions across previous stages")
    recommendation_challenges: List[str] = Field(default_factory=list, description="Direct challenges to the market entry plan")
    mitigations: List[str] = Field(default_factory=list, description="Priority mitigation actions before capital commitment")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score")
    evidence: List[str] = Field(default_factory=list, description="Grounded dataset references")


# -------------------------------------------------------------
# Action Planner Schemas (Stage 6)
# -------------------------------------------------------------
class ActionTask(BaseModel):
    task: str = Field(..., description="Actionable task title")
    description: str = Field(..., description="Specific, non-vague description of work and methodology")
    priority: Literal["Critical", "High", "Medium", "Low"] = Field(default="High", description="Task priority rating")
    owner: str = Field(default="Japan HQ / Local Lead", description="Accountable owner or function")
    dependency: str = Field(default="None", description="Pre-requisite task or approval gate")
    expected_outcome: str = Field(..., description="Concrete deliverable or outcome")
    success_metric: str = Field(default="Target to be defined by company", description="Measurable indicator of completion")
    risk_addressed: str = Field(default="General execution risk", description="Specific Red Team risk mitigated by this task")

class DecisionGate(BaseModel):
    gate: str = Field(..., description="Gate title e.g. Gate 1: Market Validation")
    question: str = Field(..., description="Critical decision-making question")
    required_evidence: List[str] = Field(default_factory=list, description="Data points and deliverables needed to pass gate")
    decision_owner: str = Field(default="Executive Committee / Managing Director", description="Accountable leadership role")
    status: Literal["Open", "Ready", "Blocked"] = Field(default="Open", description="Gate status: Open, Ready, or Blocked")

class PriorityAction(BaseModel):
    action: str = Field(..., description="Immediate practical action")
    why_now: str = Field(..., description="Strategic urgency rationale connected to upstream findings")
    expected_outcome: str = Field(..., description="Immediate concrete outcome")
    dependency: str = Field(default="None", description="Prerequisite constraint")

class OutreachPack(BaseModel):
    recipient_type: str = Field(default="Indian System Integrator / Master Distributor", description="Target recipient classification")
    subject: str = Field(..., description="Professional email or outreach subject line")
    message: str = Field(..., description="Polished B2B outreach introduction message")
    call_to_action: str = Field(default="Schedule a 30-minute bilateral exploratory call", description="Proposed next step")

class ActionPlannerResult(BaseModel):
    executive_recommendation: str = Field(
        default="Proceed with phased India entry via hybrid System Integrator PoC pilot and regional distributor warehousing.",
        description="Overarching executive go/no-go recommendation"
    )
    entry_strategy: str = Field(
        default="Direct Import PoC (Months 1-3) -> Authorized Integration Partner (Months 4-6) -> Domestic Sub-assembly (Year 2).",
        description="Comprehensive 3-phase go-to-market posture"
    )
    priority_actions: List[PriorityAction] = Field(default_factory=list, description="Top 3 immediate actions")
    days_1_30: List[ActionTask] = Field(default_factory=list, description="Days 1-30: Validation & Preparation tasks")
    days_31_60: List[ActionTask] = Field(default_factory=list, description="Days 31-60: Partner & Pilot Preparation tasks")
    days_61_90: List[ActionTask] = Field(default_factory=list, description="Days 61-90: Pilot Execution & Expansion Decision tasks")
    key_dependencies: List[str] = Field(default_factory=list, description="Critical external dependencies")
    success_metrics: List[str] = Field(default_factory=list, description="Measurable milestones")
    decision_gates: List[DecisionGate] = Field(default_factory=list, description="Formal evaluation gates")
    outreach_pack: OutreachPack = Field(
        default_factory=lambda: OutreachPack(
            recipient_type="Indian System Integrator",
            subject="Partnership Exploration: Japanese High-Precision Collaborative Robotics",
            message="We are exploring distribution and integration partnerships for our compact collaborative robotics line in India.",
            call_to_action="30-minute introductory meeting"
        ),
        description="Partner initial outreach pack"
    )
    confidence: float = Field(default=0.92, ge=0.0, le=1.0, description="Confidence score")
    evidence: List[str] = Field(default_factory=list, description="Traceability references across all prior stages (SOURCE DATA)")
    assumptions: List[str] = Field(default_factory=list, description="Core execution assumptions (ASSUMPTIONS)")


# -------------------------------------------------------------
# Executive Brief & Export Schemas (Stage 7 / Synthesis)
# -------------------------------------------------------------
class EvidenceClassificationItem(BaseModel):
    category: Literal["SOURCE DATA", "AI INFERENCE", "ASSUMPTION"] = Field(
        default="SOURCE DATA",
        description="Evidence type: SOURCE DATA (verified fact/record), AI INFERENCE (analytical deduction), or ASSUMPTION (operating postulate)"
    )
    statement: str = Field(..., description="Fact, deduction, or operational assumption")
    source_stage: str = Field(default="Market Lens", description="Originating agent or dataset reference")

class KeyDecisionIndicators(BaseModel):
    market_fit_score: int = Field(default=80, ge=0, le=100, description="KIZUNA market fit indicator (0-100)")
    partner_fit_score: int = Field(default=85, ge=0, le=100, description="KIZUNA partner capability indicator (0-100)")
    launch_risk_level: str = Field(default="Medium", description="KIZUNA composite launch risk (Low, Medium, High, Critical)")
    confidence_score: float = Field(default=0.90, ge=0.0, le=1.0, description="KIZUNA decision-support confidence indicator (0.0-1.0)")
    disclaimer: str = Field(
        default="KIZUNA decision-support indicators are AI-assisted analytical scores, not objective market truth.",
        description="Mandatory advisory label"
    )

class ExecutiveBriefResult(BaseModel):
    model_config = {"populate_by_name": True}

    title: str = Field(default="KIZUNA AI — India Market Entry Brief", description="Brief report title")
    company: str = Field(..., description="Japanese Enterprise name")
    product: str = Field(..., description="Product system and model")
    target_market: str = Field(..., description="Target Indian industrial segment and geography")
    executive_summary: str = Field(..., description="Concise boardroom executive summary")
    market_opportunity: str = Field(..., description="Market size, growth signals, and regional cluster demand")
    competitive_position: str = Field(..., description="Competitive landscape, differentiation, and gap exploitation")
    partner_strategy: str = Field(..., description="GTM partner ecosystem, SI vs Distributor allocation")
    risk_summary: str = Field(..., description="Adversarial Red Team risks and required mitigation posture")
    entry_strategy: str = Field(..., description="3-phase strategic entry posture")
    plan_90_day: str = Field(..., alias="90_day_plan", description="Concise synthesis of 90-day milestone execution plan")
    next_actions: List[PriorityAction] = Field(default_factory=list, description="Immediate practical next actions")
    decision_gates: List[DecisionGate] = Field(default_factory=list, description="Formal boardroom milestone evaluation gates")
    key_assumptions: List[str] = Field(default_factory=list, description="Explicit operational assumptions")
    evidence: List[EvidenceClassificationItem] = Field(default_factory=list, description="Categorized evidence: SOURCE DATA, AI INFERENCE, ASSUMPTION")
    indicators: KeyDecisionIndicators = Field(default_factory=KeyDecisionIndicators, description="KIZUNA decision-support metrics")
    confidence: float = Field(default=0.92, ge=0.0, le=1.0, description="Overall synthesis confidence score")
    language: str = Field(default="en", description="Brief language: 'en' (English) or 'ja' (Japanese)")
    generated_at: str = Field(..., description="ISO timestamp of generation")


# -------------------------------------------------------------
# Generic Execution Container
# -------------------------------------------------------------
class AgentExecutionOutput(BaseModel):
    agent_name: str
    status: str  # "completed" | "failed"
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    input_summary: Optional[str] = None
    error: Optional[str] = None
    execution_time_seconds: Optional[float] = None

