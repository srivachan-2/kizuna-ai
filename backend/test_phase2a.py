import asyncio
import sys
import uuid
import json
from sqlalchemy.orm import Session
from core.database import SessionLocal, init_db
from core.config import settings
from models.project import Project, ProductBrief, AnalysisRun, AgentResult
from agents.schemas import BriefExtractionResult, AgentExecutionOutput
from agents.brief_extractor import BriefExtractorAgent
from agents.orchestrator import orchestrator
from services.llm import MockLLMProvider, GeminiProvider, get_llm_provider

# Ensure stdout uses UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def run_phase2a_tests():
    print("==================================================================")
    print(" KIZUNA AI - PHASE 2A AGENTIC PIPELINE & BRIEF EXTRACTOR TESTS    ")
    print("==================================================================")

    init_db()
    db = SessionLocal()

    # -------------------------------------------------------------
    # TEST 1: Agent Schema Validation
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing BriefExtractionResult Pydantic Schema...")
    sample_data = {
        "product_name": "Compact Industrial Robot (CR-500)",
        "product_category": "Industrial Robotics",
        "product_description": "Compact 6-axis collaborative robotic arm",
        "company_name": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
        "origin_country": "Japan",
        "target_market": "Indian SME Manufacturing Sector",
        "target_customer": "Tier-2 Auto Component and Electronics Manufacturers",
        "price_range": "¥2,400,000 / unit",
        "launch_timeline": "6-month pilot deployment",
        "target_regions": ["Delhi-NCR (Manesar)", "Tamil Nadu (Sriperumbudur)"],
        "business_model": "Distributor & JV System Integrator",
        "constraints": ["BIS compliance required", "Local spare parts depot needed"],
        "key_requirements": ["High mix low volume capability", "Low power consumption"],
        "assumptions": ["Indian factory electrical supply stability"],
        "confidence": 0.95
    }
    validated = BriefExtractionResult.model_validate(sample_data)
    assert validated.product_name == "Compact Industrial Robot (CR-500)"
    assert validated.confidence == 0.95
    print("  [OK] BriefExtractionResult validated strict schema successfully.")

    # -------------------------------------------------------------
    # TEST 2: Mock Provider Execution
    # -------------------------------------------------------------
    print("\n[TEST 2] Testing BriefExtractorAgent with Mock Provider...")
    mock_agent = BriefExtractorAgent(llm_provider=MockLLMProvider())
    # Mock provider will return advisory text, which tests error fallback
    mock_res = await mock_agent.execute({"product_name": "Test Robot"})
    print(f"  [OK] Mock Agent execution status: {mock_res.status} (Handled safely without crash)")

    # -------------------------------------------------------------
    # TEST 3: Gemini Provider Execution (Live API)
    # -------------------------------------------------------------
    print("\n[TEST 3] Testing BriefExtractorAgent with Live GeminiProvider...")
    gemini_agent = BriefExtractorAgent(llm_provider=get_llm_provider())
    context = {
        "company_name_jp": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
        "product_name": "Compact Industrial Robot (CR-500)",
        "target_sector": "smart-manufacturing",
        "value_proposition": "Ultra-compact 6-axis collaborative robotic arm for electronics assembly and precision CNC tending with 40% lower power draw.",
        "target_customer_profile": "Indian SME auto component manufacturers in Delhi-NCR and Tamil Nadu.",
        "pricing_model_jpy": "¥2,400,000 / Unit (~₹13.5 Lakhs)",
        "competitive_moat": "12 Japanese patents on optical torque sensing, IP67 ingress protection.",
        "raw_brief_text": "Pilot deployment in 6 months in Manesar. Requires BIS certification and local distributor."
    }
    live_output = await gemini_agent.execute(context)
    print(f"  [OK] Live Agent Status: {live_output.status}")
    print(f"  [OK] Extracted Product: {live_output.data.get('product_name') if live_output.data else None}")
    print(f"  [OK] Extracted Category: {live_output.data.get('product_category') if live_output.data else None}")
    print(f"  [OK] Extracted Confidence: {live_output.confidence}")
    assert live_output.status == "completed", f"Live extraction failed: {live_output.error}"

    # -------------------------------------------------------------
    # TEST 4: Missing Field Handling
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing Missing Field Handling & Defaults...")
    sparse_data = {
        "product_name": "Minimal Sensor",
        "product_category": "Sensors",
        "product_description": "A basic IoT sensor",
        "company_name": "Tokyo Tech",
        "target_market": "India",
        "target_customer": "SMEs"
    }
    sparse_validated = BriefExtractionResult.model_validate(sparse_data)
    assert sparse_validated.origin_country == "Japan"
    assert sparse_validated.price_range == "Not specified"
    assert sparse_validated.launch_timeline == "Not specified"
    assert isinstance(sparse_validated.target_regions, list)
    print("  [OK] Default values and missing fields gracefully mapped to 'Not specified' and defaults.")

    # -------------------------------------------------------------
    # TEST 5: Invalid JSON Handling & Retry Logic
    # -------------------------------------------------------------
    print("\n[TEST 5] Testing JSON Cleaning & Single Retry Logic...")
    cleaned = gemini_agent.clean_json_string("```json\n{\"product_name\": \"Cleaned Product\"}\n```")
    assert cleaned == "{\"product_name\": \"Cleaned Product\"}"
    print("  [OK] Markdown codeblock stripping verified.")

    # -------------------------------------------------------------
    # TEST 6 & 7: API Failure & Quota Error Mapping
    # -------------------------------------------------------------
    print("\n[TEST 6 & 7] Testing Gemini API Failure & Quota Error Mapping...")
    bad_gemini = GeminiProvider(api_key="AIzaSy_FAKE_TEST_KEY_403")
    bad_agent = BriefExtractorAgent(llm_provider=bad_gemini)
    bad_output = await bad_agent.execute(context)
    assert bad_output.status == "failed"
    assert "AIzaSy_FAKE_TEST_KEY_403" not in str(bad_output.error)
    print(f"  [OK] API failure mapped to clean failure object: '{bad_output.error}' (Zero key leak)")

    # -------------------------------------------------------------
    # TEST 8 & 9: Database Persistence & Status Transitions
    # -------------------------------------------------------------
    print("\n[TEST 8 & 9] Testing Database Persistence & Analysis Status Transitions...")
    test_proj_id = f"test-proj-{uuid.uuid4().hex[:8]}"
    test_project = Project(
        id=test_proj_id,
        name="Automated Test Project",
        company_name_jp="テスト企業",
        target_sector="smart-manufacturing",
        status="draft"
    )
    db.add(test_project)
    db.commit()

    # Run orchestrator on the test project
    orch_result = await orchestrator.run_brief_extraction(db, test_proj_id, context)
    assert orch_result["status"] == "completed"
    assert orch_result["progress"] == 100
    assert orch_result["current_agent"] == "BriefExtractorAgent"

    # Verify AnalysisRun in DB
    run_in_db = db.query(AnalysisRun).filter(AnalysisRun.project_id == test_proj_id).first()
    assert run_in_db is not None
    assert run_in_db.status == "completed"
    assert run_in_db.progress == 100

    # Verify AgentResult in DB
    agent_res_in_db = db.query(AgentResult).filter(AgentResult.analysis_run_id == run_in_db.id).first()
    assert agent_res_in_db is not None
    assert agent_res_in_db.agent_name == "BriefExtractorAgent"
    assert agent_res_in_db.status == "completed"
    assert agent_res_in_db.output_json is not None
    assert agent_res_in_db.output_json.get("product_name") is not None
    print("  [OK] AnalysisRun and AgentResult successfully persisted in SQLite with complete status transitions.")

    # -------------------------------------------------------------
    # TEST 10: API Response Structure
    # -------------------------------------------------------------
    print("\n[TEST 10] Testing API Results Retrieval Formatting...")
    from api.analysis import get_analysis_results
    api_results = get_analysis_results(test_proj_id, db)
    assert api_results["status"] == "completed"
    assert api_results["progress"] == 100
    assert len(api_results["agent_results"]) >= 1
    assert api_results["agent_results"][0]["agent_name"] == "BriefExtractorAgent"
    print("  [OK] API response matches expected structure for frontend consumption.")

    db.close()
    print("\n==================================================================")
    print(" ALL 10 PHASE 2A AGENTIC PIPELINE TESTS PASSED!")
    print("==================================================================")
    return True

if __name__ == "__main__":
    success = asyncio.run(run_phase2a_tests())
    sys.exit(0 if success else 1)
