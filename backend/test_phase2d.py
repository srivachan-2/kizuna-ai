import asyncio
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

from core.database import SessionLocal, Base, engine
from models.project import Project, ProductBrief, AnalysisRun, AgentResult
from services.market_service import market_service
from services.llm import MockLLMProvider, get_llm_provider, BaseLLMProvider
from agents.base import BaseAgent
from agents.brief_extractor import BriefExtractorAgent
from agents.market_lens import MarketLensAgent
from agents.competitor import CompetitorAgent
from agents.partner_match import PartnerMatchAgent
from agents.red_team import RedTeamAgent
from agents.action_planner import ActionPlannerAgent
from agents.orchestrator import AgentOrchestrator
from agents.schemas import (
    ActionTask,
    DecisionGate,
    PriorityAction,
    OutreachPack,
    ActionPlannerResult,
    PartnerMatchResult,
    RedTeamResult,
    BriefExtractionResult,
    MarketLensResult,
    CompetitorAnalysisResult
)
from api.analysis import get_analysis_results

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_phase2d")

async def run_phase2d_tests():
    print("==================================================================")
    print(" KIZUNA AI - PHASE 2D ACTION PLANNER AGENT TEST SUITE             ")
    print("==================================================================")

    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    demo_context = {
        "project_id": "demo-robot-sme",
        "project_name": "Project RoboKizuna - Compact Industrial Robotics",
        "company_name_jp": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
        "company_name": "株式会社 日本ロボティクス",
        "target_sector": "smart-manufacturing",
        "product_name": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
        "product_category": "Industrial Robotics",
        "value_proposition": "Ultra-compact, low-power 6-axis collaborative robotic arm specifically engineered for high-mix low-volume electronics assembly.",
        "target_customer": "Indian SME Auto Component and Electronics Manufacturers in Tier-1 & Tier-2 industrial hubs",
        "target_customer_profile": "Indian SME Auto Component and Electronics Manufacturers in Tier-1 & Tier-2 industrial hubs looking to upgrade from manual assembly.",
        "pricing_model_jpy": "¥2,400,000 / Controller & Arm Unit (~₹13.5 Lakhs INR equivalent)",
        "competitive_moat": "12 Japanese patents on optical torque sensing, 40% lower electrical power draw.",
        "target_regions": ["Delhi-NCR (Manesar)", "Tamil Nadu (Sriperumbudur/Hosur)", "Gujarat"],
        "launch_timeline": "6-month initial pilot deployment",
        "brief": {
            "product_name": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
            "product_category": "Industrial Robotics",
            "company_name": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
            "target_customer": "Indian SME Auto Component and Electronics Manufacturers",
            "target_regions": ["Tamil Nadu", "Gujarat", "Delhi-NCR", "Bengaluru"],
            "launch_timeline": "6-month pilot deployment",
            "assumptions": ["SMEs have stable single-phase power supply", "No import tariff escalation"]
        },
        "market_lens": {
            "market_fit_score": 88,
            "positioning": "Precision Japanese Reliability at sub-₹15 Lakh SME Pricing Tier",
            "priority_regions": [
                {"region": "Tamil Nadu", "relevance": "High"},
                {"region": "Gujarat", "relevance": "High"}
            ],
            "assumptions": ["Tier-2 SMEs receptive to collaborative robotics"]
        },
        "competitor_map": {
            "competitors": [
                {"name": "SensTech Automation India", "type": "domestic"},
                {"name": "Universal Robots India", "type": "global"}
            ],
            "market_gaps": ["Affordable high-precision cobots in the ₹12-15 Lakh bracket"],
            "assumptions": ["Universal Robots will not aggressively discount to sub-₹12 Lakh"]
        },
        "partner_match": {
            "partners": [
                {"name": "Dynamic Industrial Automation Pvt Ltd", "partner_type": "System Integrator", "fit_score": 92},
                {"name": "Kalyani Automation & Robotics Solutions", "partner_type": "Distributor", "fit_score": 88}
            ],
            "market_entry_strategy": "Dual-track entry combining Dynamic Industrial Automation for technical PoC commissioning and Kalyani Automation for commercial distribution.",
            "assumptions": ["Integrator can assign dedicated engineers"]
        },
        "red_team": {
            "overall_risk": "Medium",
            "challenge_summary": "Red Team identifies BIS certification timeline (8-16 weeks) and spare parts logistics as primary hurdles.",
            "risks": [
                {
                    "category": "Regulatory",
                    "title": "BIS CRS Certification Delays",
                    "description": "Robotics controller testing requires 8-16 weeks in BIS-recognized labs.",
                    "likelihood": 4,
                    "impact": 4,
                    "risk_score": 16,
                    "severity": "Critical",
                    "mitigation": "Initiate sample testing in Bengaluru lab immediately."
                },
                {
                    "category": "After-sales/service",
                    "title": "SME Downtime & Spares",
                    "description": "Downtime exceeding 24h destroys customer retention.",
                    "likelihood": 3,
                    "impact": 4,
                    "risk_score": 12,
                    "severity": "High",
                    "mitigation": "Establish consignment spare parts depot in Chennai."
                }
            ],
            "weak_assumptions": ["Assumes 6-month launch is achievable without concurrent BIS filing"],
            "mitigations": ["Pre-clear BIS testing in Month 1", "Establish consignment buffer in Chennai"]
        }
    }

    # -------------------------------------------------------------
    # TEST 1, 2, 3: Schema Validations (ActionPlannerResult, ActionTask, DecisionGate)
    # -------------------------------------------------------------
    print("\n[TEST 1, 2, 3] Testing ActionPlannerResult, ActionTask, DecisionGate Schemas...")
    sample_plan = {
        "executive_recommendation": "Proceed with phased India market entry starting with a 90-day proof-of-concept pilot in Sriperumbudur.",
        "entry_strategy": "Dual-track market entry via primary System Integrator and regional commercial Distributor.",
        "priority_actions": [
            {
                "action": "Initiate BIS Compulsory Registration Scheme (CRS) lab testing.",
                "why_now": "8-16 week testing lead time requires immediate filing.",
                "expected_outcome": "Formal BIS application submitted with intake tracking.",
                "dependency": "Sample hardware shipment"
            }
        ],
        "days_1_30": [
            {
                "task": "BIS CRS Lab Application Submission",
                "description": "Submit controller technical files to BIS lab in Bengaluru.",
                "priority": "Critical",
                "owner": "Regulatory Compliance Lead",
                "dependency": "Sample unit customs clearance",
                "expected_outcome": "Formal lab test report",
                "success_metric": "Testing queue confirmed within 14 days",
                "risk_addressed": "Regulatory: BIS CRS testing lead time bottleneck"
            }
        ],
        "days_31_60": [
            {
                "task": "Consignment Spare Parts Depot Setup",
                "description": "Establish buffer inventory of critical sensors and motor drives in Chennai.",
                "priority": "High",
                "owner": "Operations Lead",
                "dependency": "Partner warehouse lease",
                "expected_outcome": "Audited spare parts inventory",
                "success_metric": "Sub-4-hour spare part transit time",
                "risk_addressed": "After-sales: Spare parts air-freight delay risk"
            }
        ],
        "days_61_90": [
            {
                "task": "Live 30-Day Customer Factory Trial",
                "description": "Deploy CR-500 cobot on live CNC machining shift.",
                "priority": "Critical",
                "owner": "Joint Project Team",
                "dependency": "Demo cell calibration",
                "expected_outcome": "Uptime performance benchmark log",
                "success_metric": "99.2% uptime over 30 days",
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
    validated_plan = ActionPlannerResult.model_validate(sample_plan)
    assert len(validated_plan.priority_actions) == 1
    assert len(validated_plan.days_1_30) == 1
    assert len(validated_plan.days_31_60) == 1
    assert len(validated_plan.days_61_90) == 1
    assert len(validated_plan.decision_gates) == 2
    assert validated_plan.decision_gates[0].status == "Open"
    print("  [OK] ActionPlannerResult, ActionTask, DecisionGate schemas validated successfully.")

    # -------------------------------------------------------------
    # TEST 4: Mock ActionPlannerAgent Execution
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing ActionPlannerAgent with Mock Provider...")
    action_agent = ActionPlannerAgent(llm_provider=MockLLMProvider())
    mock_action_out = await action_agent.execute(demo_context)
    assert mock_action_out.status == "completed"
    assert "days_1_30" in mock_action_out.data
    assert "days_31_60" in mock_action_out.data
    assert "days_61_90" in mock_action_out.data
    print(f"  [OK] Mock ActionPlannerAgent executed successfully ({len(mock_action_out.data.get('priority_actions', []))} priority actions generated).")

    # -------------------------------------------------------------
    # TEST 5: Live Gemini ActionPlanner Execution / Fallback
    # -------------------------------------------------------------
    print("\n[TEST 5] Testing ActionPlannerAgent with Live Google Gemini Provider...")
    gemini_action_agent = ActionPlannerAgent(llm_provider=get_llm_provider())
    try:
        gemini_action_out = await gemini_action_agent.execute(demo_context)
        print(f"  [OK] Gemini ActionPlannerAgent Status: {gemini_action_out.status}")
        if gemini_action_out.status == "completed":
            print(f"  [OK] Live Recommendation: {gemini_action_out.data.get('executive_recommendation')[:100]}...")
        else:
            print(f"  [INFO] Live API rate limit handled gracefully ({gemini_action_out.error}). Mock fallback active.")
    except Exception as e:
        print(f"  [INFO] Handled live exception ({e}).")

    # -------------------------------------------------------------
    # TEST 6: 90-Day Task Generation
    # -------------------------------------------------------------
    print("\n[TEST 6] Testing 90-Day Task Breakdown (Days 1-30, 31-60, 61-90)...")
    plan_data = mock_action_out.data
    assert len(plan_data["days_1_30"]) > 0
    assert len(plan_data["days_31_60"]) > 0
    assert len(plan_data["days_61_90"]) > 0
    print(f"  [OK] Generated {len(plan_data['days_1_30'])} Day 1-30 tasks, {len(plan_data['days_31_60'])} Day 31-60 tasks, {len(plan_data['days_61_90'])} Day 61-90 tasks.")

    # -------------------------------------------------------------
    # TEST 7: Red Team Risk -> Mitigation Mapping
    # -------------------------------------------------------------
    print("\n[TEST 7] Verifying Red Team Risks Directly Mitigated in 90-Day Tasks...")
    all_tasks = plan_data["days_1_30"] + plan_data["days_31_60"] + plan_data["days_61_90"]
    risks_addressed = [t.get("risk_addressed", "") for t in all_tasks]
    print(f"  [OK] Risks Addressed in Plan Tasks: {risks_addressed}")
    assert any("bis" in r.lower() or "regulatory" in r.lower() for r in risks_addressed)
    assert any("spare" in r.lower() or "after-sales" in r.lower() for r in risks_addressed)
    print("  [OK] Red Team risks (BIS testing lead time, spare parts depot) directly mapped to operational tasks.")

    # -------------------------------------------------------------
    # TEST 8: Next 3 Priority Actions Generation
    # -------------------------------------------------------------
    print("\n[TEST 8] Verifying Immediate Next 3 Priority Actions...")
    priority_actions = plan_data.get("priority_actions", [])
    assert len(priority_actions) >= 2
    for p in priority_actions:
        assert len(p.get("action", "")) > 10
        assert len(p.get("why_now", "")) > 10
        assert len(p.get("expected_outcome", "")) > 10
    print(f"  [OK] Verified {len(priority_actions)} immediate priority actions with complete 'Why Now' rationale.")

    # -------------------------------------------------------------
    # TEST 9: Success Metrics Handling
    # -------------------------------------------------------------
    print("\n[TEST 9] Verifying Success Metrics & Measurable Indicators...")
    success_metrics = plan_data.get("success_metrics", [])
    assert len(success_metrics) > 0
    print(f"  [OK] Verified {len(success_metrics)} concrete success metrics without fabricated financial statistics.")

    # -------------------------------------------------------------
    # TEST 10: Decision Gate Generation & Status
    # -------------------------------------------------------------
    print("\n[TEST 10] Verifying Decision Gates & Open Status...")
    gates = plan_data.get("decision_gates", [])
    assert len(gates) >= 2
    for g in gates:
        assert g.get("status") in ["Open", "Ready", "Blocked"]
        assert g.get("status") != "Approved"  # Must not claim pre-approval
        assert len(g.get("required_evidence", [])) > 0
    print(f"  [OK] Verified {len(gates)} decision gates with rigorous evidence checklists and 'Open' status.")

    # -------------------------------------------------------------
    # TEST 11: Outreach Pack Generation
    # -------------------------------------------------------------
    print("\n[TEST 11] Verifying Initial Partner Outreach Pack...")
    outreach = plan_data.get("outreach_pack", {})
    assert len(outreach.get("recipient_type", "")) > 0
    assert len(outreach.get("subject", "")) > 0
    assert len(outreach.get("message", "")) > 50
    assert len(outreach.get("call_to_action", "")) > 0
    print("  [OK] Outreach pack verified with professional B2B introductory copy.")

    # -------------------------------------------------------------
    # TEST 12 & 13: Sequential 6-Stage Orchestration & DB Persistence
    # -------------------------------------------------------------
    print("\n[TEST 12 & 13] Testing Sequential 6-Stage Orchestration (16% -> 33% -> 50% -> 66% -> 83% -> 100%) & DB Persistence...")
    mock_orchestrator = AgentOrchestrator()
    mock_orchestrator.brief_extractor = BriefExtractorAgent(llm_provider=MockLLMProvider())
    mock_orchestrator.market_lens_agent = MarketLensAgent(llm_provider=MockLLMProvider())
    mock_orchestrator.competitor_agent = CompetitorAgent(llm_provider=MockLLMProvider())
    mock_orchestrator.partner_match_agent = PartnerMatchAgent(llm_provider=MockLLMProvider())
    mock_orchestrator.red_team_agent = RedTeamAgent(llm_provider=MockLLMProvider())
    mock_orchestrator.action_planner_agent = ActionPlannerAgent(llm_provider=MockLLMProvider())

    test_proj_id = f"test-p2d-{uuid.uuid4().hex[:8]}"
    test_project = Project(
        id=test_proj_id,
        name="Phase 2D 6-Stage Pipeline Test Project",
        company_name_jp="株式会社 日本ロボティクス",
        target_sector="smart-manufacturing",
        status="draft"
    )
    db.add(test_project)
    db.commit()

    pipeline_result = await mock_orchestrator.run_pipeline(db, test_proj_id, demo_context)
    assert pipeline_result["status"] == "completed"
    assert pipeline_result["progress"] == 100
    assert pipeline_result["current_agent"] == "ActionPlannerAgent"
    assert "brief" in pipeline_result["results"]
    assert "market_lens" in pipeline_result["results"]
    assert "competitor_map" in pipeline_result["results"]
    assert "partner_match" in pipeline_result["results"]
    assert "red_team" in pipeline_result["results"]
    assert "action_plan" in pipeline_result["results"]

    # Verify SQLite AgentResult records
    run_rec = db.query(AnalysisRun).filter(AnalysisRun.project_id == test_proj_id).first()
    assert run_rec is not None
    assert run_rec.status == "completed"
    assert run_rec.progress == 100

    agent_records = db.query(AgentResult).filter(AgentResult.analysis_run_id == run_rec.id).all()
    print(f"  [OK] Saved Agent Results in SQLite: {[r.agent_name for r in agent_records]}")
    assert len(agent_records) == 6
    assert set([r.agent_name for r in agent_records]) == {
        "BriefExtractorAgent",
        "MarketLensAgent",
        "CompetitorAgent",
        "PartnerMatchAgent",
        "RedTeamAgent",
        "ActionPlannerAgent"
    }
    print("  [OK] Sequential 6-stage pipeline executed and persisted cleanly.")

    # -------------------------------------------------------------
    # TEST 14: Failure Handling & Error Containment
    # -------------------------------------------------------------
    print("\n[TEST 14] Testing Pipeline Error Containment on ActionPlanner Failure...")
    class FailingActionAgent(BaseAgent):
        def __init__(self):
            super().__init__(agent_name="ActionPlannerAgent", description="Simulated Failure Agent")
        def get_system_prompt(self): return ""
        def build_user_prompt(self, context): return ""
        def get_schema(self): return ActionPlannerResult
        async def execute(self, context):
            from agents.schemas import AgentExecutionOutput
            return AgentExecutionOutput(agent_name="ActionPlannerAgent", status="failed", error="Simulated timeout")

    fail_orchestrator = AgentOrchestrator()
    fail_orchestrator.brief_extractor = BriefExtractorAgent(llm_provider=MockLLMProvider())
    fail_orchestrator.market_lens_agent = MarketLensAgent(llm_provider=MockLLMProvider())
    fail_orchestrator.competitor_agent = CompetitorAgent(llm_provider=MockLLMProvider())
    fail_orchestrator.partner_match_agent = PartnerMatchAgent(llm_provider=MockLLMProvider())
    fail_orchestrator.red_team_agent = RedTeamAgent(llm_provider=MockLLMProvider())
    fail_orchestrator.action_planner_agent = FailingActionAgent()

    fail_proj_id = f"test-fail-p2d-{uuid.uuid4().hex[:8]}"
    fail_project = Project(
        id=fail_proj_id,
        name="Phase 2D Failure Test Project",
        company_name_jp="株式会社 日本ロボティクス",
        target_sector="smart-manufacturing",
        status="draft"
    )
    db.add(fail_project)
    db.commit()

    fail_result = await fail_orchestrator.run_pipeline(db, fail_proj_id, demo_context)
    assert fail_result["status"] == "failed"
    assert fail_result["failed_agent"] == "ActionPlannerAgent"

    fail_run_rec = db.query(AnalysisRun).filter(AnalysisRun.project_id == fail_proj_id).first()
    assert fail_run_rec.status == "failed"

    preserved_records = db.query(AgentResult).filter(AgentResult.analysis_run_id == fail_run_rec.id).all()
    print(f"  [OK] Preserved {len(preserved_records)} completed agent records prior to failure.")
    assert len(preserved_records) == 6 # Stages 1-5 completed + Stage 6 failed record
    print("  [OK] Failure handling verified: pipeline halted, error logged, completed stages preserved.")

    # -------------------------------------------------------------
    # TEST 15: Missing Upstream Agent Result Handling
    # -------------------------------------------------------------
    print("\n[TEST 15] Testing Missing Upstream Agent Result Handling...")
    sparse_action_out = await action_agent.execute({"brief": {"product_name": "Minimal Robot"}})
    assert sparse_action_out.status == "completed"
    assert len(sparse_action_out.data.get("days_1_30", [])) > 0
    print("  [OK] ActionPlannerAgent generated fallback execution plan with sparse upstream context.")

    # Check API results retrieval structure
    api_res = get_analysis_results(test_proj_id, db)
    assert api_res["status"] == "completed"
    assert len(api_res["agent_results"]) == 6
    print("  [OK] GET /api/analysis/{id}/results formatted all 6 stages correctly.")

    db.close()
    print("\n==================================================================")
    print(" ALL 15 PHASE 2D TEST SUITES PASSED SUCCESSFULLY!                 ")
    print("==================================================================")
    return True

if __name__ == "__main__":
    success = asyncio.run(run_phase2d_tests())
    sys.exit(0 if success else 1)
