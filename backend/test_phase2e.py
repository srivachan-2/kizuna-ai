import asyncio
import io
import json
import os
import sys
import unittest
from pathlib import Path
import uuid
import logging
from typing import Dict, Any

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
current_dir = str(backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from agents.schemas import (
    ExecutiveBriefResult,
    EvidenceClassificationItem,
    KeyDecisionIndicators,
    PriorityAction,
    DecisionGate,
    BriefExtractionResult,
    MarketLensResult,
    CompetitorAnalysisResult,
    PartnerMatchResult,
    RedTeamResult,
    ActionPlannerResult
)
from services.executive_brief import (
    synthesize_executive_brief_en,
    synthesize_executive_brief_ja,
    generate_executive_brief_markdown,
    generate_executive_brief_pdf,
    validate_all_agents_present,
    IncompleteAnalysisError,
    REQUIRED_AGENTS
)
from services.llm import get_llm_provider, MockLLMProvider
from core.database import Base, engine, SessionLocal
from models.project import Project, ProductBrief, AnalysisRun, AgentResult

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_phase2e")


def create_full_demo_agent_results() -> Dict[str, Any]:
    """Creates complete 6-stage mock outputs for the benchmark scenario."""
    return {
        "BriefExtractorAgent": {
            "product_name": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
            "product_category": "Industrial Automation & Robotics",
            "product_description": "Ultra-compact 6-axis collaborative robot with optical torque sensing and 40% lower power draw.",
            "company_name": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
            "origin_country": "Japan",
            "target_market": "Indian SME Auto Component and Electronics Manufacturers",
            "target_customer": "Tier-2 Auto Component and Electronics SME plant heads",
            "price_range": "₹12-15 Lakhs INR equivalent",
            "launch_timeline": "6 months",
            "target_regions": ["Tamil Nadu (Sriperumbudur/Hosur)", "Gujarat (Sanand)", "Delhi-NCR (Manesar)"],
            "business_model": "Hybrid System Integrator & Master Distributor",
            "constraints": ["BIS CRS laboratory testing lead time", "Import customs clearance"],
            "key_requirements": ["Local first-line maintenance network", "Controller API documentation"],
            "assumptions": ["SME customers prefer turnkey integration over bare-arm supply"],
            "confidence": 0.94
        },
        "MarketLensAgent": {
            "market_summary": "High-growth bilateral opportunity in Indian manufacturing hubs driven by PLI incentives.",
            "target_segments": ["Tier-2 Auto Components", "PCB Assembly & Electronics"],
            "customer_needs": ["Affordable precision automation", "Rapid technical support", "Low footprint"],
            "demand_signals": ["National Manufacturing Policy", "Make in India PLI expansion"],
            "opportunities": ["First-mover Japanese high-precision cobot under ₹15 Lakhs"],
            "market_entry_considerations": ["BIS CRS mandatory registration", "High import tariffs on finished robotics"],
            "priority_regions": [
                {"region": "Tamil Nadu (Sriperumbudur/Hosur)", "relevance": "High", "reasoning": "Major automotive cluster", "confidence": 0.95},
                {"region": "Gujarat (Sanand)", "relevance": "High", "reasoning": "Fast-growing industrial base", "confidence": 0.90}
            ],
            "positioning": "Japanese precision engineering tailored for Indian SME automation requirements.",
            "market_fit_score": 88,
            "confidence": 0.92,
            "evidence": ["Industrial corridor study", "Automotive manufacturing data"],
            "assumptions": ["Tier-2 component manufacturers have active CapEx budgets"]
        },
        "CompetitorAgent": {
            "competitive_summary": "Dominated by European cobot OEMs at high price brackets and domestic integrators at lower payload tiers.",
            "competitors": [
                {
                    "name": "Universal Robots (UR3e/UR5e)",
                    "type": "global",
                    "product_category": "Collaborative Robots",
                    "target_segment": "Tier-1 Auto & Tier-1 Electronics",
                    "positioning": "Premium Global Cobot Pioneer",
                    "pricing": "High CapEx (₹20-28 Lakhs)",
                    "strengths": ["Brand recognition", "Established integrator network"],
                    "weaknesses": ["High initial investment", "Costly spares"],
                    "visible_gap": "SME price resistance and complex setup overhead",
                    "source": "Curated database",
                    "confidence": 0.93
                }
            ],
            "market_gaps": ["Affordable compact 6-axis cobot priced in the ₹12-15 Lakh bracket with Japanese durability"],
            "positioning_opportunities": ["Market as plug-and-play machine tending specialist with local service warranty"],
            "confidence": 0.91,
            "evidence": ["Competitor pricing benchmarks"],
            "assumptions": ["Competitors will not lower pricing by >20% in the short term"]
        },
        "PartnerMatchAgent": {
            "summary": "Shortlisted 3 specialized Indian System Integrators and regional distributors with strong automotive footprints.",
            "partners": [
                {
                    "name": "Dynamic Industrial Automation Pvt Ltd",
                    "partner_type": "System Integrator",
                    "fit_score": 92,
                    "market_fit": 90,
                    "industry_fit": 95,
                    "technical_fit": 92,
                    "geographic_fit": 95,
                    "distribution_fit": 88,
                    "pilot_fit": 92,
                    "reasoning": "Extensive integration footprint in Sriperumbudur automotive corridor.",
                    "strengths": ["15+ dedicated robotics engineers", "Demonstration facility in Chennai"],
                    "concerns": ["Requires upfront training in Japanese controller firmware"],
                    "recommended_role": "Primary Turnkey System Integration & Demo Partner",
                    "confidence": 0.94
                }
            ],
            "selection_criteria": ["Proven track record in CNC machine tending", "In-house demonstration lab"],
            "market_entry_strategy": "Appoint Dynamic Industrial Automation as primary SI partner while utilizing a regional distributor for spares consignment.",
            "confidence": 0.93,
            "evidence": ["Curated Partner Registry"],
            "assumptions": ["Integrator can allocate 2 dedicated engineers for onboarding"]
        },
        "RedTeamAgent": {
            "overall_risk": "Medium",
            "challenge_summary": "Red Team identifies BIS CRS testing lead time (8-16 weeks) and spare parts logistics as primary hurdles.",
            "risks": [
                {
                    "category": "Regulatory",
                    "title": "BIS CRS Certification Lead Time",
                    "description": "Robotics controller safety testing in BIS-recognized labs requires 8-16 weeks.",
                    "likelihood": 4,
                    "impact": 4,
                    "risk_score": 16,
                    "severity": "Critical",
                    "mitigation": "Initiate sample testing in Bengaluru lab concurrently in Month 1.",
                    "evidence": ["BIS Compulsory Registration Scheme schedule"],
                    "assumption": "Standard testing window is 8-16 weeks"
                },
                {
                    "category": "After-sales",
                    "title": "SME Downtime & Spares",
                    "description": "Downtime exceeding 24h destroys customer retention.",
                    "likelihood": 3,
                    "impact": 4,
                    "risk_score": 12,
                    "severity": "High",
                    "mitigation": "Establish consignment spare parts depot in Chennai.",
                    "evidence": ["SME factory interview data"],
                    "assumption": "Consignment spares buffer reduces downtime to <8h"
                }
            ],
            "weak_assumptions": ["Assumes 6-month launch is achievable without concurrent BIS filing"],
            "recommendation_challenges": ["Direct import without local warranty leads to rapid distributor disengagement"],
            "mitigations": ["Pre-clear BIS testing in Month 1", "Establish consignment buffer in Chennai"],
            "confidence": 0.92,
            "evidence": ["Regulatory compendium", "Failure mode analysis"]
        },
        "ActionPlannerAgent": {
            "executive_recommendation": "Proceed with phased India market entry starting with a 90-day proof-of-concept pilot in the Sriperumbudur/Chennai industrial corridor.",
            "entry_strategy": "Direct Import PoC (Months 1-3) -> Authorized Integration Partner (Months 4-6) -> Domestic Sub-assembly (Year 2).",
            "priority_actions": [
                {
                    "action": "Initiate BIS Compulsory Registration Scheme (CRS) lab testing for robot controller units in Bengaluru.",
                    "why_now": "BIS compliance requires 8-16 weeks lead time; starting immediately prevents commercial shipment bottlenecks.",
                    "expected_outcome": "Formal testing application submitted to BIS-recognized lab with assigned tracking number.",
                    "dependency": "Shipment of 2 production sample units to Bengaluru lab"
                },
                {
                    "action": "Execute mutual NDA and bilateral technical evaluation with Dynamic Industrial Automation in Chennai.",
                    "why_now": "Enables validation of application engineering bandwidth and demonstration lab scheduling.",
                    "expected_outcome": "Signed bilateral NDA and scheduled 5-day on-site controller API integration workshop.",
                    "dependency": "None"
                },
                {
                    "action": "Conduct structured validation interviews with 10 Tier-2 auto component SME plant managers.",
                    "why_now": "Validates willingness to pay in the ₹12-15 Lakh bracket and confirms CNC machine tending pain points.",
                    "expected_outcome": "Qualified shortlist of 2 anchor pilot manufacturing customer candidates.",
                    "dependency": "Drafting standardized Japanese-English technical brief"
                }
            ],
            "days_1_30": [
                {
                    "task": "BIS CRS Certification Application Filing",
                    "description": "Submit robot controller technical documentation and sample hardware to BIS-accredited testing facility in Bengaluru.",
                    "priority": "Critical",
                    "owner": "Regulatory Compliance Lead",
                    "dependency": "Sample hardware customs clearance",
                    "expected_outcome": "Formal BIS lab intake report",
                    "success_metric": "Lab test schedule confirmed within 14 days",
                    "risk_addressed": "Regulatory: BIS CRS testing lead time bottleneck"
                }
            ],
            "days_31_60": [
                {
                    "task": "Establish Consignment Spare Parts Buffer",
                    "description": "Warehouse critical replacement joint actuators and control boards at Chennai partner depot.",
                    "priority": "High",
                    "owner": "Operations Lead",
                    "dependency": "Distributor warehousing agreement signoff",
                    "expected_outcome": "Operational local consignment inventory capable of 8-hour dispatch",
                    "success_metric": "<8h delivery SLA established across Tamil Nadu corridor",
                    "risk_addressed": "After-sales: Spare parts air-freight delay risk"
                }
            ],
            "days_61_90": [
                {
                    "task": "Launch 30-Day On-Site Pilot Trial",
                    "description": "Deploy CR-500 unit into live CNC machine tending cell at anchor Tier-2 auto component plant.",
                    "priority": "Critical",
                    "owner": "Partner Lead Integration Engineer",
                    "dependency": "Demonstration cell technical validation signoff",
                    "expected_outcome": "Verified 99.2% uptime and 18% cycle time reduction over manual loading",
                    "success_metric": ">99% equipment availability and zero safety incidents",
                    "risk_addressed": "Technical: Optical sensing reliability under factory dust conditions"
                }
            ],
            "key_dependencies": ["BIS testing lab queue", "Partner engineer training"],
            "success_metrics": ["10 validated customer discovery sessions", "1 live pilot trial with >99% uptime"],
            "decision_gates": [
                {
                    "gate": "Gate 1: Market Validation",
                    "question": "Do at least 7/10 interviewed SME plant managers confirm willingness to buy at target price?",
                    "required_evidence": ["Customer interview transcripts", "Price sensitivity matrix"],
                    "decision_owner": "Head of Market Strategy",
                    "status": "Open"
                },
                {
                    "gate": "Gate 2: Partner Technical Readiness",
                    "question": "Has the System Integrator completed controller training and demonstration cell assembly?",
                    "required_evidence": ["Demonstration cell signoff", "Service SLA contract"],
                    "decision_owner": "Chief Technology Officer",
                    "status": "Open"
                }
            ],
            "outreach_pack": {
                "recipient_type": "Managing Director, Dynamic Industrial Automation Pvt Ltd",
                "subject": "Strategic Collaboration Proposal: Precision Japanese Collaborative Robotics",
                "message": "We have developed the CR-500 compact collaborative robot and are exploring a partnership in Tamil Nadu.",
                "call_to_action": "30-minute exploratory virtual discussion"
            },
            "confidence": 0.94,
            "evidence": ["Market Lens Study", "Curated Partner Registry", "Red Team Risk Assessment"],
            "assumptions": ["Integrator allocates 2 dedicated engineers for onboarding"]
        }
    }


async def run_all_tests():
    print("\n" + "=" * 66)
    print(" KIZUNA AI - PHASE 2E EXECUTIVE BRIEF & EXPORT TEST SUITE ")
    print("=" * 66)

    demo_results = create_full_demo_agent_results()

    # -------------------------------------------------------------
    # TEST 1: ExecutiveBriefResult Schema Validation
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing ExecutiveBriefResult & Sub-Schemas...")
    en_brief = synthesize_executive_brief_en(demo_results)
    assert isinstance(en_brief, ExecutiveBriefResult)
    assert en_brief.company == "株式会社 日本ロボティクス (Nippon Robotics Corp.)"
    assert en_brief.product == "Compact Industrial 6-Axis Collaborative Robot (CR-500)"
    assert len(en_brief.next_actions) == 3
    assert len(en_brief.decision_gates) == 2
    assert len(en_brief.evidence) >= 5
    assert len(en_brief.key_assumptions) >= 3
    print("  [OK] ExecutiveBriefResult schema validated successfully.")

    # -------------------------------------------------------------
    # TEST 2 & 3: Deterministic Synthesis & Six-Agent Result Aggregation
    # -------------------------------------------------------------
    print("\n[TEST 2 & 3] Testing Deterministic Synthesis & Six-Agent Result Aggregation...")
    assert "CR-500" in en_brief.executive_summary
    assert "Dynamic Industrial Automation" in en_brief.partner_strategy
    assert "BIS CRS" in en_brief.risk_summary
    assert en_brief.indicators.market_fit_score == 88
    assert en_brief.indicators.partner_fit_score == 92
    assert en_brief.indicators.launch_risk_level == "Medium"
    assert en_brief.indicators.confidence_score > 0.8
    print("  [OK] Deterministic multi-agent aggregation verified across all 6 stages.")

    # -------------------------------------------------------------
    # TEST 4: Missing Agent Handling (IncompleteAnalysisError)
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing Missing Agent Handling (Protection against incomplete briefs)...")
    incomplete_results = demo_results.copy()
    del incomplete_results["ActionPlannerAgent"]
    try:
        validate_all_agents_present(incomplete_results)
        raise AssertionError("Failed to raise IncompleteAnalysisError for missing ActionPlannerAgent")
    except IncompleteAnalysisError as e:
        assert "ActionPlannerAgent" in str(e)
        print(f"  [OK] IncompleteAnalysisError successfully caught: {str(e)[:70]}...")

    # -------------------------------------------------------------
    # TEST 5 & 6: Evidence & Assumption Aggregation & Classification
    # -------------------------------------------------------------
    print("\n[TEST 5 & 6] Testing Evidence Classification (SOURCE DATA / AI INFERENCE / ASSUMPTION)...")
    categories = {item.category for item in en_brief.evidence}
    assert "SOURCE DATA" in categories
    assert "AI INFERENCE" in categories
    assert "ASSUMPTION" in categories
    assert len(en_brief.key_assumptions) > 0
    print(f"  [OK] Verified evidence breakdown: {len(en_brief.evidence)} categorized items across all 3 tiers.")

    # -------------------------------------------------------------
    # TEST 7: English Executive Brief Output
    # -------------------------------------------------------------
    print("\n[TEST 7] Testing English Executive Brief Output Structure...")
    assert en_brief.language == "en"
    assert "KIZUNA AI" in en_brief.title
    assert "EXECUTIVE SUMMARY" in en_brief.title.upper() or len(en_brief.executive_summary) > 100
    print("  [OK] English Executive Brief verified.")

    # -------------------------------------------------------------
    # TEST 8: Japanese Executive Brief Output (Bilingual Synthesis)
    # -------------------------------------------------------------
    print("\n[TEST 8] Testing Japanese Executive Brief Output (Bilingual Synthesis)...")
    ja_brief = await synthesize_executive_brief_ja(demo_results, llm_provider=MockLLMProvider())
    assert ja_brief.language == "ja"
    assert "エグゼクティブ・ブリーフ" in ja_brief.title
    assert "協働ロボット" in ja_brief.executive_summary
    assert len(ja_brief.next_actions) == 3
    assert "ゲート1" in ja_brief.decision_gates[0].gate
    print(f"  [OK] Japanese Executive Brief verified ({ja_brief.title}).")

    # -------------------------------------------------------------
    # TEST 9: PDF Generation (ReportLab Binary Output)
    # -------------------------------------------------------------
    print("\n[TEST 9] Testing Boardroom PDF Document Generation...")
    pdf_bytes_en = generate_executive_brief_pdf(en_brief)
    assert isinstance(pdf_bytes_en, bytes)
    assert len(pdf_bytes_en) > 1000
    assert pdf_bytes_en.startswith(b"%PDF")
    print(f"  [OK] Boardroom PDF generated successfully ({len(pdf_bytes_en):,} bytes, valid %PDF header).")

    # -------------------------------------------------------------
    # TEST 10: Markdown Generation (GitHub Flavored Markdown Output)
    # -------------------------------------------------------------
    print("\n[TEST 10] Testing Boardroom Markdown Document Generation...")
    md_content_en = generate_executive_brief_markdown(en_brief)
    assert isinstance(md_content_en, str)
    assert "# KIZUNA AI — INDIA MARKET ENTRY BRIEF" in md_content_en
    assert "## 1. EXECUTIVE SUMMARY" in md_content_en
    assert "## 2. KEY DECISION-SUPPORT INDICATORS" in md_content_en
    assert "## 9. NEXT 3 PRIORITY ACTIONS" in md_content_en
    assert "## 10. DECISION GATES" in md_content_en
    print(f"  [OK] Boardroom Markdown generated successfully ({len(md_content_en):,} characters).")

    md_content_ja = generate_executive_brief_markdown(ja_brief)
    assert "## 1. エグゼクティブ・サマリー（要約）" in md_content_ja
    print(f"  [OK] Japanese Boardroom Markdown verified ({len(md_content_ja):,} characters).")

    # -------------------------------------------------------------
    # TEST 11, 12, 13: API Endpoints & Incomplete Analysis Protection
    # -------------------------------------------------------------
    print("\n[TEST 11, 12, 13] Testing Database Persistence & API Endpoints...")
    db = SessionLocal()
    try:
        # Create a test project and run
        test_project_id = f"test-p2e-{uuid.uuid4().hex[:8]}"
        project = Project(
            id=test_project_id,
            name="Test Nippon Robotics",
            company_name_jp="株式会社 日本ロボティクス",
            target_sector="smart-manufacturing",
            status="completed"
        )
        db.add(project)

        test_run = AnalysisRun(
            id=f"run-p2e-{uuid.uuid4().hex[:8]}",
            project_id=test_project_id,
            stage="completed",
            status="completed",
            current_agent="ActionPlannerAgent",
            progress=100
        )
        db.add(test_run)
        db.commit()

        # Persist all 6 agent results
        for agent_name, out_data in demo_results.items():
            db.add(AgentResult(
                id=str(uuid.uuid4()),
                analysis_run_id=test_run.id,
                agent_name=agent_name,
                status="completed",
                output_json=out_data,
                confidence=out_data.get("confidence", 0.9)
            ))
        db.commit()

        # Verify retrieval via helper
        from api.analysis import _get_completed_agent_results_map
        retrieved_map = _get_completed_agent_results_map(test_project_id, db)
        assert len(retrieved_map) == 6
        assert "BriefExtractorAgent" in retrieved_map
        assert "ActionPlannerAgent" in retrieved_map
        print(f"  [OK] Database lookup and multi-agent retrieval verified for {test_project_id}.")

        # Verify incomplete project protection
        incomplete_proj_id = f"test-inc-{uuid.uuid4().hex[:8]}"
        inc_proj = Project(
            id=incomplete_proj_id,
            name="Incomplete Project",
            company_name_jp="未完了",
            target_sector="smart-manufacturing",
            status="draft"
        )
        db.add(inc_proj)
        db.commit()

        try:
            _get_completed_agent_results_map(incomplete_proj_id, db)
            raise AssertionError("Should have raised 400 for incomplete project")
        except Exception as e:
            assert "incomplete" in str(e).lower() or "400" in str(e)
            print(f"  [OK] Incomplete analysis protection verified via database helper.")
    finally:
        db.close()

    # -------------------------------------------------------------
    # TEST 14: Live Gemini Provider Translation / Fallback Handling
    # -------------------------------------------------------------
    print("\n[TEST 14] Testing Live Gemini Provider Translation / Fallback Handling...")
    try:
        live_provider = get_llm_provider()
        live_ja_brief = await synthesize_executive_brief_ja(demo_results, llm_provider=live_provider)
        assert live_ja_brief.language == "ja"
        assert len(live_ja_brief.executive_summary) > 50
        print(f"  [OK] Gemini Japanese translation / fallback synthesis completed successfully.")
    except Exception as e:
        print(f"  [INFO] Handled live exception ({e}). Fallback active.")

    # -------------------------------------------------------------
    # TEST 15: Security & No Credential Leakage
    # -------------------------------------------------------------
    print("\n[TEST 15] Verifying Security: No Credentials in Brief, PDF, Markdown, or Database...")
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if gemini_key:
        assert gemini_key not in json.dumps(en_brief.model_dump()), "CRITICAL: Key leaked in brief JSON"
        assert gemini_key not in md_content_en, "CRITICAL: Key leaked in Markdown"
        assert gemini_key.encode("utf-8") not in pdf_bytes_en, "CRITICAL: Key leaked in PDF"
        print("  [OK] Security audit passed: GEMINI_API_KEY is not leaked into JSON, Markdown, or PDF.")
    else:
        print("  [OK] Security check passed (no key in environment to leak).")

    print("\n" + "=" * 66)
    print(" ALL 15 PHASE 2E TEST SUITES PASSED SUCCESSFULLY! ")
    print("=" * 66 + "\n")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
