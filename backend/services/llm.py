import os
import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from core.config import settings

logger = logging.getLogger("kizuna.llm")

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        """Generate response given a system instruction and user prompt."""
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Test API connectivity safely without leaking credentials."""
        pass

class MockLLMProvider(BaseLLMProvider):
    """Mock Provider for offline local testing and development."""
    def __init__(self, model_name: str = "mock-agent-engine"):
        self.model_name = model_name

    async def generate_response(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        sys_lower = system_prompt.lower()
        prompt_text = (system_prompt + " " + user_prompt).lower()

        if "action planner" in sys_lower or "action plan" in prompt_text or "90-day" in prompt_text or "decision_gates" in prompt_text:
            return (
                '{\n'
                '  "executive_recommendation": "Proceed with phased India market entry starting with a 90-day proof-of-concept pilot in the Sriperumbudur/Chennai industrial corridor.",\n'
                '  "entry_strategy": "Dual-track market entry: Authorize a Master Distributor for INR billing while partnering with a specialized System Integrator for turnkey application engineering.",\n'
                '  "priority_actions": [\n'
                '    {\n'
                '      "action": "Initiate BIS Compulsory Registration Scheme (CRS) lab testing for robot controller units in Bengaluru.",\n'
                '      "why_now": "BIS compliance requires 8-16 weeks lead time; starting immediately prevents commercial shipment bottlenecks.",\n'
                '      "expected_outcome": "Formal testing application submitted to BIS-recognized lab with assigned tracking number.",\n'
                '      "dependency": "Shipment of 2 production sample units to Bengaluru lab"\n'
                '    },\n'
                '    {\n'
                '      "action": "Execute mutual NDA and bilateral technical evaluation with Dynamic Industrial Automation in Chennai.",\n'
                '      "why_now": "Enables validation of application engineering bandwidth and demonstration lab scheduling.",\n'
                '      "expected_outcome": "Signed bilateral NDA and scheduled 5-day on-site controller API integration workshop.",\n'
                '      "dependency": "None"\n'
                '    },\n'
                '    {\n'
                '      "action": "Conduct structured validation interviews with 10 Tier-2 auto component SME plant managers.",\n'
                '      "why_now": "Validates willingness to pay in the ₹12-15 Lakh bracket and confirms CNC machine tending pain points.",\n'
                '      "expected_outcome": "Qualified shortlist of 2 anchor pilot manufacturing customer candidates.",\n'
                '      "dependency": "Drafting standardized Japanese-English technical brief"\n'
                '    }\n'
                '  ],\n'
                '  "days_1_30": [\n'
                '    {\n'
                '      "task": "BIS CRS Certification Application Filing",\n'
                '      "description": "Submit robot controller technical documentation and sample hardware to BIS-accredited testing facility in Bengaluru.",\n'
                '      "priority": "Critical",\n'
                '      "owner": "Regulatory Compliance Lead",\n'
                '      "dependency": "Sample hardware customs clearance",\n'
                '      "expected_outcome": "Formal BIS lab intake report",\n'
                '      "success_metric": "Lab test schedule confirmed within 14 days",\n'
                '      "risk_addressed": "Regulatory: BIS CRS testing lead time bottleneck"\n'
                '    },\n'
                '    {\n'
                '      "task": "Shortlist and Interview 10 Target SME Plant Managers",\n'
                '      "description": "Conduct structured customer discovery interviews with Tier-2 machine tool shops in Sriperumbudur and Manesar to validate cycle-time requirements.",\n'
                '      "priority": "High",\n'
                '      "owner": "Market Strategy Lead",\n'
                '      "dependency": "None",\n'
                '      "expected_outcome": "Customer discovery synthesis document",\n'
                '      "success_metric": "10 validated interviews completed",\n'
                '      "risk_addressed": "Pricing: SME CapEx resistance at ₹12-15 Lakh bracket"\n'
                '    }\n'
                '  ],\n'
                '  "days_31_60": [\n'
                '    {\n'
                '      "task": "Establish Consignment Spare Parts Buffer Depot",\n'
                '      "description": "Set up dedicated buffer stock of critical optical sensors, joint motors, and cable harnesses at partner facility in Chennai.",\n'
                '      "priority": "High",\n'
                '      "owner": "Supply Chain & Operations",\n'
                '      "dependency": "Partner warehouse SLA finalization",\n'
                '      "expected_outcome": "Audited spare parts inventory ready for dispatch",\n'
                '      "success_metric": "Sub-4-hour spare part transit time to major auto clusters",\n'
                '      "risk_addressed": "After-sales: Spare parts air-freight delay risk"\n'
                '    }\n'
                '  ],\n'
                '  "days_61_90": [\n'
                '    {\n'
                '      "task": "Execute Live 30-Day SME Factory Floor Pilot",\n'
                '      "description": "Deploy 1 CR-500 collaborative robot at a selected Tier-2 auto component plant for CNC lathe tending under actual production shift conditions.",\n'
                '      "priority": "Critical",\n'
                '      "owner": "Joint Project Team (Japan HQ + Local SI)",\n'
                '      "dependency": "Demo cell calibration & client safety audit",\n'
                '      "expected_outcome": "Production trial performance log",\n'
                '      "success_metric": "99.2% uptime and 18% cycle-time reduction over 30 days",\n'
                '      "risk_addressed": "Technical: Optical sensing reliability under factory dust conditions"\n'
                '    }\n'
                '  ],\n'
                '  "key_dependencies": [\n'
                '    "BIS testing laboratory throughput and sample customs clearance",\n'
                '    "Dedicated partner engineering staff allocation for training in Japan or virtually"\n'
                '  ],\n'
                '  "success_metrics": [\n'
                '    "10 validated SME customer discovery sessions completed",\n'
                '    "BIS laboratory testing certification in progress",\n'
                '    "1 live customer production pilot achieving >99% uptime over 30 days"\n'
                '  ],\n'
                '  "decision_gates": [\n'
                '    {\n'
                '      "gate": "Gate 1: Market & Customer Validation",\n'
                '      "question": "Do at least 7 out of 10 interviewed SME plant managers confirm willingness to purchase at ₹12-15 Lakhs?",\n'
                '      "required_evidence": ["Interview transcripts", "Pain-point ranking matrix"],\n'
                '      "decision_owner": "Head of Market Strategy",\n'
                '      "status": "Open"\n'
                '    },\n'
                '    {\n'
                '      "gate": "Gate 2: Partner Technical Qualification",\n'
                '      "question": "Has the selected System Integrator successfully integrated the robot controller with standard Indian CNC machines?",\n'
                '      "required_evidence": ["PoC integration benchmark report", "24/7 service SLA signoff"],\n'
                '      "decision_owner": "Chief Technology Officer",\n'
                '      "status": "Open"\n'
                '    }\n'
                '  ],\n'
                '  "outreach_pack": {\n'
                '    "recipient_type": "Managing Director / Head of Robotics, Dynamic Industrial Automation Pvt Ltd",\n'
                '    "subject": "Strategic Collaboration Proposal: Precision Japanese Collaborative Robotics for Indian SME Auto Sector",\n'
                '    "message": "Dear Leadership Team,\\n\\nWe are contacting you from Nippon Robotics Corp. (Japan). We have developed the CR-500, a compact, high-precision 6-axis collaborative robot designed specifically for high-mix low-volume CNC machine tending and electronics assembly with 40% lower power draw.\\n\\nWe are currently structuring our India market launch and would welcome the opportunity to discuss a mutual technical pilot and demonstration cell deployment at your Sriperumbudur facility.",\n'
                '    "call_to_action": "Would your technical team be available for a 30-minute exploratory virtual discussion next week?"\n'
                '  },\n'
                '  "confidence": 0.94,\n'
                '  "evidence": ["Market Lens Regional Study", "Competitor Matrix", "Curated Partner Registry", "Adversarial Red Team Assessment"],\n'
                '  "assumptions": ["Selected System Integrator maintains operational bandwidth for Japanese OEM training"]\n'
                '}'
            )
        elif "red team" in sys_lower or "red team" in prompt_text or "risk" in sys_lower:
            return (
                '{\n'
                '  "overall_risk": "Medium",\n'
                '  "challenge_summary": "Red Team analysis highlights key exposure in local field support availability, BIS certification timelines, and INR currency volatility.",\n'
                '  "risks": [\n'
                '    {\n'
                '      "category": "Regulatory",\n'
                '      "title": "BIS Compulsory Registration Scheme (CRS) Delays",\n'
                '      "description": "Robotics controller electronics require domestic testing in BIS-recognized labs, introducing an 8 to 16 week lead-time bottleneck before commercial dispatch.",\n'
                '      "likelihood": 4,\n'
                '      "impact": 4,\n'
                '      "risk_score": 16,\n'
                '      "severity": "Critical",\n'
                '      "evidence": ["BIS Compulsory Registration Scheme (CRS) Schedule II"],\n'
                '      "assumption": "Assumes initial prototype shipments can bypass local BIS certification (Invalid assumption)",\n'
                '      "mitigation": "Initiate sample unit testing in accredited Bangalore labs immediately upon project sanction."\n'
                '    },\n'
                '    {\n'
                '      "category": "After-sales/service",\n'
                '      "title": "SME Downtime Sensitivity vs Local Spare Part Logistics",\n'
                '      "description": "Indian SME machine shops operate on thin margins; a 48-hour robotic cell downtime due to air-freighted Japanese spare parts will destroy client retention.",\n'
                '      "likelihood": 3,\n'
                '      "impact": 4,\n'
                '      "risk_score": 12,\n'
                '      "severity": "High",\n'
                '      "evidence": ["Curated Partner Dataset"],\n'
                '      "assumption": "Assumes partner field engineers can resolve optical sensor faults without dedicated local buffer stock",\n'
                '      "mitigation": "Establish a mandatory consignment spare-parts depot in Chennai/Pune prior to commercial deliveries."\n'
                '    },\n'
                '    {\n'
                '      "category": "Pricing",\n'
                '      "title": "SME Price Resistance at ₹12-15 Lakh Bracket",\n'
                '      "description": "While cheaper than European cobots, Indian Tier-2 SMEs frequently defer automation CapEx if domestic retrofit alternatives remain sub-₹8 Lakh.",\n'
                '      "likelihood": 3,\n'
                '      "impact": 3,\n'
                '      "risk_score": 9,\n'
                '      "severity": "Medium",\n'
                '      "evidence": ["Curated Competitor Dataset"],\n'
                '      "assumption": "Assumes SME machine shops place premium value on optical precision over upfront payback period",\n'
                '      "mitigation": "Structure flexible equipment leasing or Pay-Per-Hour robotics-as-a-service (RaaS) financing via local NBFC partners."\n'
                '    }\n'
                '  ],\n'
                '  "weak_assumptions": [\n'
                '    "Assumption that Indian SME machine shops can commission complex optical feedback robots without extensive on-site retraining.",\n'
                '    "Assumption that 6-month launch timeline is achievable without concurrent BIS certification processing."\n'
                '  ],\n'
                '  "recommendation_challenges": [\n'
                '    "Direct import model risks margin erosion unless auxiliary metal fabrication is localized within 90 days."\n'
                '  ],\n'
                '  "mitigations": [\n'
                '    "Pre-clear BIS compliance testing in Bengaluru prior to commercial shipment commitment.",\n'
                '    "Establish local consignment buffer inventory for critical wear-and-tear components in Chennai."\n'
                '  ],\n'
                '  "confidence": 0.93,\n'
                '  "evidence": [\n'
                '    "Bureau of Indian Standards (BIS) Electronics Certification Guidelines",\n'
                '    "Curated Competitor & Partner Seed Dataset"\n'
                '  ]\n'
                '}'
            )
        elif "partner" in sys_lower or "partner" in prompt_text:
            return (
                '{\n'
                '  "summary": "Identified qualified Indian distribution and integration partners with high regional synergy for precision industrial robotics.",\n'
                '  "partners": [\n'
                '    {\n'
                '      "name": "Dynamic Industrial Automation Pvt Ltd",\n'
                '      "partner_type": "System Integrator",\n'
                '      "fit_score": 92,\n'
                '      "market_fit": 23,\n'
                '      "industry_fit": 19,\n'
                '      "technical_fit": 19,\n'
                '      "geographic_fit": 14,\n'
                '      "distribution_fit": 8,\n'
                '      "pilot_fit": 9,\n'
                '      "reasoning": "Strong engineering presence in Sriperumbudur automotive corridor with dedicated 5,000 sq.ft automation demo facility.",\n'
                '      "strengths": ["Turnkey robotic cell integration", "24/7 on-site field support in South India"],\n'
                '      "concerns": ["Requires initial technical training on proprietary Japanese controller APIs"],\n'
                '      "recommended_role": "Primary System Integrator for Tamil Nadu & Karnataka clusters",\n'
                '      "source": "Curated demo dataset",\n'
                '      "confidence": 0.94\n'
                '    },\n'
                '    {\n'
                '      "name": "Kalyani Automation & Robotics Solutions",\n'
                '      "partner_type": "Distributor",\n'
                '      "fit_score": 88,\n'
                '      "market_fit": 22,\n'
                '      "industry_fit": 18,\n'
                '      "technical_fit": 16,\n'
                '      "geographic_fit": 14,\n'
                '      "distribution_fit": 10,\n'
                '      "pilot_fit": 8,\n'
                '      "reasoning": "Extensive industrial distribution reach across Gujarat, Maharashtra, and NCR with INR billing capability.",\n'
                '      "strengths": ["40+ sales touchpoints", "Direct INR invoicing & customs duty clearance"],\n'
                '      "concerns": ["Lower deep-tech vision/optical sensor expertise"],\n'
                '      "recommended_role": "Master Commercial Distributor for Western & Northern India",\n'
                '      "source": "Curated demo dataset",\n'
                '      "confidence": 0.91\n'
                '    }\n'
                '  ],\n'
                '  "selection_criteria": [\n'
                '    "Market Fit (25%): Target customer and SME overlap",\n'
                '    "Industry Fit (20%): Sector-specific automation track record",\n'
                '    "Technical Fit (20%): Robotics, PLC, and sensor integration capabilities",\n'
                '    "Geographic Fit (15%): Presence in key industrial hubs (TN, Gujarat, NCR, KA)",\n'
                '    "Distribution Fit (10%): In-country warehousing and INR invoicing",\n'
                '    "Pilot Capability (10%): Dedicated PoC demo facilities"\n'
                '  ],\n'
                '  "market_entry_strategy": "Dual-track entry combining Dynamic Industrial Automation for technical PoC commissioning and Kalyani Automation for commercial distribution.",\n'
                '  "confidence": 0.93,\n'
                '  "evidence": ["Curated Partner Dataset (4 verified Indian entities)"],\n'
                '  "assumptions": ["Integrator can assign 3 dedicated application engineers for onboarding"]\n'
                '}'
            )
        elif "competitor" in sys_lower or "competitor" in prompt_text:
            return (
                '{\n'
                '  "competitive_summary": "Indian robotics market is bifurcated between high-cost global incumbents and low-precision domestic retrofits.",\n'
                '  "competitors": [\n'
                '    {\n'
                '      "name": "SensTech Automation India Pvt Ltd",\n'
                '      "type": "domestic",\n'
                '      "product_category": "Industrial Automation & Retrofit Robotics",\n'
                '      "target_segment": "Indian Tier-2 & Tier-3 SME Machine Shops",\n'
                '      "positioning": "Low-cost local automation",\n'
                '      "pricing": "₹6,00,000 - ₹9,00,000 per arm",\n'
                '      "strengths": ["INR direct billing", "Local field engineering"],\n'
                '      "weaknesses": ["Higher failure rate", "No optical torque sensing"],\n'
                '      "visible_gap": "Lacks high-precision optical feedback and low electrical power draw.",\n'
                '      "source": "DPIIT Industrial Automation Registry 2024",\n'
                '      "confidence": 0.92\n'
                '    },\n'
                '    {\n'
                '      "name": "Universal Robots India (Teradyne)",\n'
                '      "type": "global",\n'
                '      "product_category": "Collaborative Robots (Cobots)",\n'
                '      "target_segment": "Tier-1 Automotive OEMs and Global Electronics Manufacturers",\n'
                '      "positioning": "Premium global market leader",\n'
                '      "pricing": "₹18,00,000 - ₹26,00,000 per unit",\n'
                '      "strengths": ["Strong OEM brand", "Intuitive programming"],\n'
                '      "weaknesses": ["Prohibitive pricing for SMEs", "High electrical power draw"],\n'
                '      "visible_gap": "Priced above the sub-₹15 Lakh threshold of Indian SME machine shops.",\n'
                '      "source": "Invest India Robotics Sector Report 2024",\n'
                '      "confidence": 0.95\n'
                '    }\n'
                '  ],\n'
                '  "market_gaps": ["Affordable high-precision collaborative robotics in the ₹12-15 Lakh bracket."],\n'
                '  "positioning_opportunities": ["Market as Japanese zero-defect precision at a mid-tier SME price point."],\n'
                '  "confidence": 0.95,\n'
                '  "evidence": ["Curated competitor dataset (3 verified entities)"],\n'
                '  "assumptions": ["Universal Robots will not aggressively discount to sub-₹12 Lakh pricing"]\n'
                '}'
            )
        elif "market lens" in sys_lower or "viability" in prompt_text or "market" in sys_lower:
            return (
                '{\n'
                '  "market_summary": "High-growth opportunity in Indian industrial automation corridor for precision Japanese robotics.",\n'
                '  "target_segments": ["Tier-2 Auto Component SME Machine Shops", "EMS PCB Assemblers"],\n'
                '  "customer_needs": ["Affordable automation under ₹15 Lakhs", "Local servicing & INR billing"],\n'
                '  "demand_signals": ["Make in India PLI Auto Scheme", "Rising SME labor costs"],\n'
                '  "opportunities": ["Direct replacement of manual CNC loading with collaborative arms"],\n'
                '  "market_entry_considerations": ["BIS CRS Testing Lab Lead Times (12-16 weeks)"],\n'
                '  "priority_regions": [\n'
                '    {\n'
                '      "region": "Tamil Nadu",\n'
                '      "relevance": "High",\n'
                '      "reasoning": "Major automotive and electronics manufacturing belt in Sriperumbudur and Hosur.",\n'
                '      "confidence": 0.95\n'
                '    },\n'
                '    {\n'
                '      "region": "Gujarat",\n'
                '      "relevance": "High",\n'
                '      "reasoning": "Mandal-Becharaji Japanese Industrial Zone with JETRO facilitation.",\n'
                '      "confidence": 0.92\n'
                '    },\n'
                '    {\n'
                '      "region": "Delhi-NCR",\n'
                '      "relevance": "High",\n'
                '      "reasoning": "Dense concentration of tier-2 auto component suppliers in Gurgaon/Manesar.",\n'
                '      "confidence": 0.94\n'
                '    },\n'
                '    {\n'
                '      "region": "Bengaluru / Karnataka",\n'
                '      "relevance": "High",\n'
                '      "reasoning": "Precision tooling, aerospace, and electronics corridor in Peenya.",\n'
                '      "confidence": 0.90\n'
                '    }\n'
                '  ],\n'
                '  "positioning": "Precision Japanese Reliability at sub-₹15 Lakh SME Pricing Tier",\n'
                '  "market_fit_score": 88,\n'
                '  "confidence": 0.94,\n'
                '  "evidence": ["DPIIT Smart Manufacturing Registry 2024 (Market size: $14.8B)"],\n'
                '  "assumptions": ["SMEs capable of basic robotic cell programming"]\n'
                '}'
            )
        elif "brief" in sys_lower or "json" in sys_lower:
            return (
                '{\n'
                '  "product_name": "Compact Industrial Robot (Mock CR-500)",\n'
                '  "product_category": "Industrial Robotics",\n'
                '  "product_description": "Simulated 6-axis collaborative robotic arm for electronics assembly",\n'
                '  "company_name": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",\n'
                '  "origin_country": "Japan",\n'
                '  "target_market": "Indian SME Manufacturing Sector",\n'
                '  "target_customer": "Tier-2 Auto Component and Electronics Manufacturers",\n'
                '  "price_range": "¥2,400,000 / unit",\n'
                '  "launch_timeline": "6-month pilot deployment",\n'
                '  "target_regions": ["Delhi-NCR (Manesar)", "Tamil Nadu (Sriperumbudur)"],\n'
                '  "business_model": "Distributor & JV System Integrator",\n'
                '  "constraints": ["BIS CRS Lab Testing in India Required", "Local Spare Parts Depot Needed"],\n'
                '  "key_requirements": ["High-mix low-volume flexibility", "40% lower power consumption"],\n'
                '  "assumptions": ["Indian factory power voltage fluctuations managed by integrated stabilizer"],\n'
                '  "confidence": 0.95\n'
                '}'
            )
        return (
            "【KIZUNA AI INTELLIGENCE ADVISORY (MOCK MODE)】\n"
            "This is a simulated bilateral intelligence response generated in Mock Mode. "
            "To activate live AI reasoning for Japan-India market entry, configure GEMINI_API_KEY in backend/.env."
        )

    async def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "mock",
            "model": self.model_name,
            "status": "mock_mode",
            "message": "Mock AI engine active. Configure GEMINI_API_KEY in backend/.env to activate live Google Gemini intelligence."
        }

class GeminiProvider(BaseLLMProvider):
    """Official Google Gemini LLM Provider for KIZUNA AI."""
    def __init__(self, api_key: str, model_name: Optional[str] = None):
        self._api_key = api_key
        self.model_name = model_name or settings.GEMINI_MODEL or "gemini-flash-latest"
        self._client = None
        
        if self._api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self._api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini genai client: {type(e).__name__}")

    async def generate_response(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        if not self._api_key or not self._client:
            raise ValueError("GEMINI_API_KEY is not configured in backend environment.")

        from google.genai import types

        # Candidate model resolution list
        candidate_models = [self.model_name]
        if "gemini-flash-latest" not in candidate_models:
            candidate_models.append("gemini-flash-latest")
        if "gemini-3.6-flash" not in candidate_models:
            candidate_models.append("gemini-3.6-flash")

        last_err = None

        for model_candidate in candidate_models:
            try:
                config = types.GenerateContentConfig(
                    temperature=temperature,
                    system_instruction=system_prompt if system_prompt else None,
                )
                response = await self._client.aio.models.generate_content(
                    model=model_candidate,
                    contents=user_prompt,
                    config=config,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                last_err = e
                error_type = type(e).__name__
                error_msg = str(e)
                logger.warning(f"Gemini [{model_candidate}] error: {error_type} - {error_msg}")

                if "InvalidArgument" in error_type or "API_KEY_INVALID" in error_msg or "400" in error_msg:
                    raise RuntimeError("Invalid GEMINI_API_KEY or model parameter. Please verify your GEMINI_API_KEY.")
                elif "PermissionDenied" in error_type or "403" in error_msg:
                    raise RuntimeError("Access denied. Please check your GEMINI_API_KEY permissions.")
                # For 429 or 503, try next candidate model or fail immediately to activate curated fallback
                continue

        # If cloud models are unavailable or rate-limited, fail fast so agent fallback engages
        err_str = str(last_err)
        if "ResourceExhausted" in type(last_err).__name__ or "429" in err_str:
            raise RuntimeError("Google Gemini API quota limit reached. Please check your API quota or try again later.")
        raise RuntimeError(f"Gemini intelligence service error: {err_str}")

    async def test_connection(self) -> Dict[str, Any]:
        if not self._api_key:
            return {
                "success": False,
                "provider": "gemini",
                "model": self.model_name,
                "status": "not_configured",
                "message": "GEMINI_API_KEY is missing in backend/.env"
            }
        
        try:
            test_prompt = "Output only the single word: READY"
            system_instruction = "You are a connectivity test assistant for KIZUNA AI."
            response_text = await self.generate_response(system_instruction, test_prompt, temperature=0.0)
            
            return {
                "success": True,
                "provider": "gemini",
                "model": self.model_name,
                "status": "connected",
                "sample_output": response_text.strip(),
                "message": f"Successfully connected to Google Gemini ({self.model_name})."
            }
        except Exception as err:
            return {
                "success": False,
                "provider": "gemini",
                "model": self.model_name,
                "status": "error",
                "message": str(err)
            }

def get_llm_provider() -> BaseLLMProvider:
    provider_setting = settings.LLM_PROVIDER.lower()
    
    if provider_setting == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.GEMINI_MODEL
        )
    
    return MockLLMProvider(model_name=f"mock-{settings.GEMINI_MODEL}")
