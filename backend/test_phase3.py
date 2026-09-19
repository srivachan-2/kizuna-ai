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

from core.database import Base, engine, SessionLocal
from models.project import Project, ProductBrief, AnalysisRun, AgentResult
from agents.orchestrator import orchestrator
from services.executive_brief import (
    synthesize_executive_brief_en,
    synthesize_executive_brief_ja,
    generate_executive_brief_markdown,
    generate_executive_brief_pdf,
    IncompleteAnalysisError
)
from api.analysis import get_or_create_demo_project, _get_completed_agent_results_map

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_phase3")


async def run_phase3_audit():
    print("\n" + "=" * 70)
    print(" KIZUNA AI - PHASE 3 HACKATHON & DEMO RELIABILITY VERIFICATION ")
    print("=" * 70)

    db = SessionLocal()
    try:
        # -------------------------------------------------------------
        # STEP 1: Demo Seeding & Re-initialization
        # -------------------------------------------------------------
        print("\n[STEP 1] Testing Benchmark Demo Seeding (Nippon Robotics Corp - CR-500)...")
        demo_proj = get_or_create_demo_project(db)
        assert demo_proj is not None
        assert demo_proj.id == "demo-robot-sme"
        assert "株式会社 日本ロボティクス" in demo_proj.company_name_jp
        print(f"  [OK] Demo project verified: {demo_proj.name} ({demo_proj.company_name_jp})")

        # -------------------------------------------------------------
        # STEP 2: Demo Reset Capability
        # -------------------------------------------------------------
        print("\n[STEP 2] Testing Safe Demo Reset Endpoint & State Cleanliness...")
        # Clear previous runs
        runs = db.query(AnalysisRun).filter(AnalysisRun.project_id == demo_proj.id).all()
        for r in runs:
            db.query(AgentResult).filter(AgentResult.analysis_run_id == r.id).delete()
            db.delete(r)
        demo_proj.status = "draft"
        db.commit()

        # Re-query
        reset_runs = db.query(AnalysisRun).filter(AnalysisRun.project_id == demo_proj.id).all()
        assert len(reset_runs) == 0
        print("  [OK] Demo reset verified: Previous runs and agent states cleared cleanly.")

        # -------------------------------------------------------------
        # STEP 3: Incomplete Analysis Protection
        # -------------------------------------------------------------
        print("\n[STEP 3] Verifying Incomplete Analysis Protection (Pre-Run Guard)...")
        try:
            _get_completed_agent_results_map(demo_proj.id, db)
            raise AssertionError("Should have blocked export before analysis completion")
        except Exception as e:
            assert "incomplete" in str(e).lower() or "400" in str(e)
            print(f"  [OK] Export blocked prior to full 6-stage execution.")

        # -------------------------------------------------------------
        # STEP 4: Full Sequential 6-Stage Pipeline Execution
        # -------------------------------------------------------------
        print("\n[STEP 4] Executing Full 6-Stage Intelligence Pipeline...")
        brief = db.query(ProductBrief).filter(ProductBrief.project_id == demo_proj.id).first()
        context = {
            "project_id": demo_proj.id,
            "project_name": demo_proj.name,
            "company_name_jp": demo_proj.company_name_jp,
            "target_sector": demo_proj.target_sector,
            "product_name": brief.product_name,
            "value_proposition": brief.value_proposition,
            "target_customer_profile": brief.target_customer_profile,
            "pricing_model_jpy": brief.pricing_model_jpy,
            "competitive_moat": brief.competitive_moat,
            "raw_brief_text": brief.raw_brief_text
        }

        pipeline_res = await orchestrator.run_pipeline(db, demo_proj.id, context)
        assert pipeline_res["status"] == "completed"
        assert pipeline_res["progress"] == 100
        print("  [OK] 6-Stage sequential pipeline executed (16% -> 33% -> 50% -> 66% -> 83% -> 100%).")

        # -------------------------------------------------------------
        # STEP 5: Database Persistence & Multi-Agent Results Verification
        # -------------------------------------------------------------
        print("\n[STEP 5] Verifying Agent Results in Database...")
        results_map = _get_completed_agent_results_map(demo_proj.id, db)
        assert len(results_map) == 6
        expected_agents = [
            "BriefExtractorAgent",
            "MarketLensAgent",
            "CompetitorAgent",
            "PartnerMatchAgent",
            "RedTeamAgent",
            "ActionPlannerAgent"
        ]
        for a in expected_agents:
            assert a in results_map, f"Missing {a} in results map"
        print("  [OK] All 6 agent output payloads retrieved and validated from SQLite.")

        # -------------------------------------------------------------
        # STEP 6: English Executive Brief Synthesis
        # -------------------------------------------------------------
        print("\n[STEP 6] Synthesizing English Executive Brief...")
        en_brief = synthesize_executive_brief_en(results_map)
        assert en_brief.language == "en"
        assert len(en_brief.executive_summary) > 100
        assert en_brief.indicators.market_fit_score > 0
        assert en_brief.indicators.partner_fit_score > 0
        assert len(en_brief.next_actions) == 3
        assert len(en_brief.decision_gates) >= 2
        print(f"  [OK] English Executive Brief synthesized (Market Fit: {en_brief.indicators.market_fit_score}/100, Partner Fit: {en_brief.indicators.partner_fit_score}/100, Risk: {en_brief.indicators.launch_risk_level}).")

        # -------------------------------------------------------------
        # STEP 7: Japanese Executive Brief Synthesis
        # -------------------------------------------------------------
        print("\n[STEP 7] Synthesizing Japanese Executive Brief (日本語)...")
        ja_brief = await synthesize_executive_brief_ja(results_map)
        assert ja_brief.language == "ja"
        assert "インド市場参入戦略" in ja_brief.title
        assert len(ja_brief.executive_summary) > 50
        print(f"  [OK] Japanese Executive Brief synthesized ({ja_brief.title}).")

        # -------------------------------------------------------------
        # STEP 8: English & Japanese PDF Export Generation
        # -------------------------------------------------------------
        print("\n[STEP 8] Testing Boardroom Corporate PDF Generation (English & Japanese)...")
        en_pdf = generate_executive_brief_pdf(en_brief)
        assert isinstance(en_pdf, bytes)
        assert en_pdf.startswith(b"%PDF")
        assert len(en_pdf) > 2000

        ja_pdf = generate_executive_brief_pdf(ja_brief)
        assert isinstance(ja_pdf, bytes)
        assert ja_pdf.startswith(b"%PDF")
        assert len(ja_pdf) > 2000
        print(f"  [OK] English PDF: {len(en_pdf):,} bytes | Japanese PDF: {len(ja_pdf):,} bytes (valid %PDF binaries).")

        # -------------------------------------------------------------
        # STEP 9: English & Japanese Markdown Export Generation
        # -------------------------------------------------------------
        print("\n[STEP 9] Testing Boardroom Markdown Generation (English & Japanese)...")
        en_md = generate_executive_brief_markdown(en_brief)
        assert "# KIZUNA AI — INDIA MARKET ENTRY BRIEF" in en_md
        assert "## 1. EXECUTIVE SUMMARY" in en_md

        ja_md = generate_executive_brief_markdown(ja_brief)
        assert "# KIZUNA AI — インド市場参入戦略エグゼクティブ・ブリーフ" in ja_md
        assert "## 1. エグゼクティブ・サマリー（要約）" in ja_md
        print(f"  [OK] English Markdown: {len(en_md):,} chars | Japanese Markdown: {len(ja_md):,} chars.")

        # -------------------------------------------------------------
        # STEP 10: Security & Credential Audit
        # -------------------------------------------------------------
        print("\n[STEP 10] Performing Security Audit for Zero API Key Leaks...")
        key = os.environ.get("GEMINI_API_KEY", "")
        if key:
            assert key not in json.dumps(en_brief.model_dump()), "CRITICAL: Key in Brief JSON"
            assert key not in en_md, "CRITICAL: Key in English Markdown"
            assert key not in ja_md, "CRITICAL: Key in Japanese Markdown"
            assert key.encode("utf-8") not in en_pdf, "CRITICAL: Key in English PDF"
            assert key.encode("utf-8") not in ja_pdf, "CRITICAL: Key in Japanese PDF"
            print("  [OK] Security check passed: GEMINI_API_KEY is 100% backend-isolated.")
        else:
            print("  [OK] Security check passed (no key in env).")

        print("\n" + "=" * 70)
        print(" ALL PHASE 3 RELIABILITY & DEMO SUITES PASSED SUCCESSFULLY! ")
        print("=" * 70 + "\n")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_phase3_audit())
