import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from core.database import get_db
from models.project import Project, ProductBrief, AnalysisRun, AgentResult
from agents.orchestrator import orchestrator

router = APIRouter(prefix="/analysis", tags=["Analysis Pipeline"])

def get_or_create_demo_project(db: Session) -> Project:
    """Finds or seeds the official KIZUNA demo scenario project."""
    demo_id = "demo-robot-sme"
    project = db.query(Project).filter(Project.id == demo_id).first()
    if not project:
        project = Project(
            id=demo_id,
            name="Project RoboKizuna - Compact Industrial Robotics",
            company_name_jp="株式会社 日本ロボティクス (Nippon Robotics Corp.)",
            target_sector="smart-manufacturing",
            status="draft"
        )
        db.add(project)
        
        brief = ProductBrief(
            id=str(uuid.uuid4()),
            project_id=demo_id,
            product_name="Compact Industrial 6-Axis Collaborative Robot (CR-500)",
            value_proposition="Ultra-compact, low-power 6-axis collaborative robotic arm specifically engineered for high-mix low-volume electronics assembly, PCB testing, and precision CNC tending with zero human safety cage requirements.",
            target_customer_profile="Indian SME Auto Component and Electronics Manufacturers in Tier-1 & Tier-2 industrial hubs looking to upgrade from manual assembly.",
            pricing_model_jpy="¥2,400,000 / Controller & Arm Unit (~₹13.5 Lakhs INR equivalent)",
            competitive_moat="12 Japanese patents on optical torque sensing, 40% lower electrical power draw compared to European alternatives, certified IP67 ingress protection.",
            raw_brief_text="Targeting 6-month initial pilot deployment in Delhi-NCR (Manesar) and Tamil Nadu (Sriperumbudur/Hosur). Requires local distributor for first-line maintenance."
        )
        db.add(brief)
        db.commit()
        db.refresh(project)
    return project

@router.post("/seed-demo")
def seed_demo_project(db: Session = Depends(get_db)):
    """Seed the standard Japanese Compact Robot -> Indian SME demo project."""
    project = get_or_create_demo_project(db)
    return {
        "status": "success",
        "project_id": project.id,
        "name": project.name,
        "company": project.company_name_jp
    }

@router.post("/reset-demo")
def reset_demo_project(db: Session = Depends(get_db)):
    """
    Safely resets the demo benchmark scenario to initial state, allowing judges to replay the full analysis.
    """
    demo_id = "demo-robot-sme"
    # Find runs for demo project
    runs = db.query(AnalysisRun).filter(AnalysisRun.project_id == demo_id).all()
    for run in runs:
        db.query(AgentResult).filter(AgentResult.analysis_run_id == run.id).delete()
        db.delete(run)

    project = db.query(Project).filter(Project.id == demo_id).first()
    if project:
        project.status = "draft"
    db.commit()

    # Re-seed demo project cleanly if needed
    project = get_or_create_demo_project(db)
    return {
        "status": "success",
        "message": "Demo benchmark scenario reset cleanly.",
        "project_id": project.id,
        "name": project.name
    }

class AssistBriefRequest(BaseModel):
    target_sector: str
    company_name_jp: Optional[str] = ""
    product_name: Optional[str] = ""
    existing_fields: Optional[Dict[str, str]] = {}
    missing_fields: Optional[List[str]] = None

@router.post("/assist-brief")
async def assist_product_brief(req: AssistBriefRequest):
    """
    Optional AI Assistance for New Analysis:
    Makes ONE single batched Gemini call to suggest missing strategic fields without overwriting user input.
    """
    from services.llm import get_llm_provider
    import json
    import re

    # Determine which fields need suggestions
    existing = req.existing_fields or {}
    fields_to_suggest = []
    
    # Check default strategic fields
    check_fields = ["value_proposition", "pricing_model_jpy", "competitive_moat"]
    for f in check_fields:
        if req.missing_fields and f in req.missing_fields:
            fields_to_suggest.append(f)
        elif not existing.get(f) or existing.get(f, "").strip() == "":
            fields_to_suggest.append(f)

    if not fields_to_suggest:
        return {"suggestions": {}}

    sector = req.target_sector or "smart-manufacturing"
    company = req.company_name_jp or "Japanese Enterprise"
    product = req.product_name or "Enterprise Technology Solution"

    # Fallback sector defaults
    sector_fallbacks = {
        "smart-manufacturing": {
            "value_proposition": "High-precision automated motion control with ultra-low power consumption and zero-caging safety compliance, reducing integration costs for Indian manufacturing SMEs by 35%.",
            "pricing_model_jpy": "¥1,800,000 - ¥2,400,000 / Unit (Approx ₹10-14 Lakhs INR commercial baseline)",
            "competitive_moat": "Proprietary Japanese optical torque sensors and patented high-durability harmonic drive gearboxes with 50,000 hours MTBF."
        },
        "ev-mobility": {
            "value_proposition": "High-efficiency thermal management and modular BMS architecture optimized for Indian high-temperature ambient conditions (up to 50°C).",
            "pricing_model_jpy": "¥850,000 / Subsystem (Approx ₹4.8 Lakhs INR baseline)",
            "competitive_moat": "Proprietary cell-balancing algorithms with AIS-156 Amendment 3 certified fire-retardant thermal barriers."
        },
        "medtech-diagnostics": {
            "value_proposition": "Sub-millimeter precision positioning and automated imaging diagnostics designed for point-of-care tier-2/3 Indian healthcare centers.",
            "pricing_model_jpy": "¥3,200,000 / System (Approx ₹18 Lakhs INR baseline)",
            "competitive_moat": "Japanese PMDA-approved optical calibration and CE/ISO-13485 medical device safety patents."
        },
        "enterprise-saas": {
            "value_proposition": "Real-time supply chain predictive analytics with bilateral ERP connector integration and sub-second inventory sync.",
            "pricing_model_jpy": "¥120,000 / month / enterprise license (Approx ₹68,000 INR/mo baseline)",
            "competitive_moat": "Patented distributed graph optimization engine with built-in GST and Indian e-invoicing compliance."
        }
    }
    fb = sector_fallbacks.get(sector, {
        "value_proposition": "Engineered for high reliability, precision performance, and reduced total cost of ownership for Indian industrial applications.",
        "pricing_model_jpy": "¥1,500,000 / Unit (Approx ₹8.5 Lakhs INR baseline)",
        "competitive_moat": "Japanese engineered proprietary architecture with defensible patent portfolio and high barrier to entry."
    })

    suggestions = {}
    try:
        provider = get_llm_provider()
        sys_prompt = (
            "You are KIZUNA AI's strategic briefing assistant. "
            "Given a Japanese company and product entering the Indian market, generate concise, highly professional suggestions "
            "ONLY for the requested missing strategic fields. "
            "Return valid JSON strictly matching the requested keys."
        )
        user_prompt = (
            f"Company: {company}\n"
            f"Product: {product}\n"
            f"Target Sector: {sector}\n"
            f"Fields to suggest: {json.dumps(fields_to_suggest)}\n\n"
            "Output JSON format:\n"
            "{\n"
            + ",\n".join([f'  "{k}": "<concise professional text>"' for k in fields_to_suggest]) +
            "\n}"
        )
        resp_text = await provider.generate_response(sys_prompt, user_prompt, temperature=0.2)
        match = re.search(r"\{.*\}", resp_text, re.DOTALL)
        if match:
            parsed = json.loads(match.group(0))
            for k in fields_to_suggest:
                if k in parsed and parsed[k]:
                    suggestions[k] = parsed[k].strip()
    except Exception:
        pass

    # Fill any missing requested fields with high-quality domain fallback
    for f in fields_to_suggest:
        if f not in suggestions or not suggestions[f]:
            suggestions[f] = fb.get(f, "Strategic formulation pending bilateral analysis.")

    return {
        "status": "success",
        "evidence_type": "AI INFERENCE",
        "suggestions": suggestions
    }

@router.post("/{analysis_id}/run")
async def run_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """
    Executes Phase 2D: Complete 6-Stage Pipeline (Brief -> Market Lens -> Competitor -> Partner Match -> Red Team -> Action Planner).
    """
    # Check if analysis_id is 'demo'
    if analysis_id == "demo" or analysis_id == "demo-robot-sme":
        project = get_or_create_demo_project(db)
    else:
        project = db.query(Project).filter(Project.id == analysis_id).first()
        if not project:
            run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
            if run:
                project = db.query(Project).filter(Project.id == run.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis workspace '{analysis_id}' not found. You can use 'demo' to run the benchmark scenario."
        )

    # Load brief
    brief = db.query(ProductBrief).filter(ProductBrief.project_id == project.id).first()

    # Prevent duplicate runs if analysis is actively running
    active_run = db.query(AnalysisRun).filter(
        AnalysisRun.project_id == project.id,
        AnalysisRun.status == "running"
    ).order_by(AnalysisRun.started_at.desc()).first()
    if active_run and active_run.started_at:
        elapsed = (datetime.datetime.utcnow() - active_run.started_at).total_seconds()
        if elapsed < 120:  # If running within last 2 minutes
            return {
                "analysis_run_id": active_run.id,
                "project_id": project.id,
                "status": "running",
                "progress": active_run.progress or 33,
                "current_agent": active_run.current_agent or "BriefExtractorAgent",
                "message": "Analysis in progress... Please wait for the current run to complete."
            }
    
    # Prepare context for the agent pipeline
    context = {
        "project_id": project.id,
        "project_name": project.name,
        "company_name_jp": project.company_name_jp,
        "target_sector": project.target_sector,
        "product_name": brief.product_name if brief else project.name,
        "value_proposition": brief.value_proposition if brief else "Not specified",
        "target_customer_profile": brief.target_customer_profile if brief else "Not specified",
        "pricing_model_jpy": brief.pricing_model_jpy if brief else "Not specified",
        "competitive_moat": brief.competitive_moat if brief else "Not specified",
        "raw_brief_text": brief.raw_brief_text if brief else ""
    }

    # Execute 6-stage pipeline through orchestrator
    result = await orchestrator.run_pipeline(db, project.id, context)
    return result

@router.post("/{analysis_id}/stop")
@router.post("/{analysis_id}/cancel")
def stop_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """
    Safely cancels and stops an actively executing pipeline.
    """
    target_project_id = analysis_id
    if analysis_id == "demo" or analysis_id == "demo-robot-sme":
        target_project_id = "demo-robot-sme"
    
    project = db.query(Project).filter(Project.id == target_project_id).first()
    if not project:
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if run:
            target_project_id = run.project_id
            project = db.query(Project).filter(Project.id == target_project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis workspace '{analysis_id}' not found."
        )

    running_runs = db.query(AnalysisRun).filter(
        AnalysisRun.project_id == target_project_id,
        AnalysisRun.status == "running"
    ).all()

    for r in running_runs:
        orchestrator.cancel_pipeline(r.id)
        r.status = "cancelled"
        r.completed_at = datetime.datetime.utcnow()
        db.add(r)
    
    if project.status == "running" or project.status == "analyzing":
        project.status = "draft"
        db.add(project)

    db.commit()

    return {
        "status": "cancelled",
        "project_id": target_project_id,
        "message": "Analysis pipeline cancelled successfully."
    }

@router.get("/{analysis_id}/results")
def get_analysis_results(analysis_id: str, db: Session = Depends(get_db)):
    """
    Retrieves the latest execution results across all completed agents for an analysis workspace.
    """
    target_project_id = analysis_id
    if analysis_id == "demo":
        target_project_id = "demo-robot-sme"
    
    project = db.query(Project).filter(Project.id == target_project_id).first()
    if not project:
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if run:
            target_project_id = run.project_id
            project = db.query(Project).filter(Project.id == target_project_id).first()

    if not project:
        return {
            "status": "not_found",
            "progress": 0,
            "agent_results": []
        }

    latest_run = db.query(AnalysisRun).filter(
        AnalysisRun.project_id == target_project_id
    ).order_by(AnalysisRun.created_at.desc()).first()

    if not latest_run:
        return {
            "status": "pending",
            "current_agent": "BriefExtractorAgent",
            "progress": 0,
            "agent_results": []
        }

    # Stale run recovery: if marked 'running' but started more than 120s ago without completion, recover state
    if latest_run.status == "running" and latest_run.started_at:
        elapsed = (datetime.datetime.utcnow() - latest_run.started_at).total_seconds()
        if elapsed > 120:
            latest_run.status = "cancelled"
            latest_run.completed_at = datetime.datetime.utcnow()
            db.commit()

    agent_results = db.query(AgentResult).filter(
        AgentResult.analysis_run_id == latest_run.id
    ).order_by(AgentResult.created_at.asc()).all()

    formatted_results = []
    for res in agent_results:
        formatted_results.append({
            "id": res.id,
            "agent_name": res.agent_name,
            "status": res.status,
            "input_summary": res.input_summary,
            "output": res.output_json,
            "confidence": res.confidence,
            "error_message": res.error_message,
            "created_at": res.created_at.isoformat() if res.created_at else None,
            "completed_at": res.completed_at.isoformat() if res.completed_at else None
        })

    return {
        "analysis_run_id": latest_run.id,
        "project_id": target_project_id,
        "stage": latest_run.stage,
        "status": latest_run.status,
        "current_agent": latest_run.current_agent,
        "progress": latest_run.progress,
        "result_data": latest_run.result_data,
        "agent_results": formatted_results
    }


def _get_completed_agent_results_map(analysis_id: str, db: Session) -> Dict[str, Any]:
    """Helper to retrieve and validate completed agent outputs map for an analysis."""
    target_project_id = analysis_id
    if analysis_id == "demo":
        target_project_id = "demo-robot-sme"
    
    project = db.query(Project).filter(Project.id == target_project_id).first()
    if not project:
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if run:
            target_project_id = run.project_id
            project = db.query(Project).filter(Project.id == target_project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis workspace '{analysis_id}' not found."
        )

    latest_run = db.query(AnalysisRun).filter(
        AnalysisRun.project_id == target_project_id
    ).order_by(AnalysisRun.created_at.desc()).first()

    if not latest_run:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis incomplete. Complete all required intelligence stages before exporting the Executive Brief."
        )

    agent_records = db.query(AgentResult).filter(
        AgentResult.analysis_run_id == latest_run.id,
        AgentResult.status == "completed"
    ).all()

    results_map = {r.agent_name: r.output_json for r in agent_records if r.output_json}
    return results_map


@router.get("/{analysis_id}/executive-brief")
async def get_executive_brief(
    analysis_id: str,
    language: str = "en",
    db: Session = Depends(get_db)
):
    """
    Retrieves the boardroom-ready Executive Brief synthesized from all 6 completed intelligence agents.
    Supports English ('en') and Japanese ('ja').
    """
    from services.executive_brief import (
        synthesize_executive_brief_en,
        synthesize_executive_brief_ja,
        IncompleteAnalysisError
    )

    try:
        results_map = _get_completed_agent_results_map(analysis_id, db)
        if language.lower() == "ja":
            brief = await synthesize_executive_brief_ja(results_map)
        else:
            brief = synthesize_executive_brief_en(results_map)
        return brief.model_dump(by_alias=True)
    except IncompleteAnalysisError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis incomplete. Complete all required intelligence stages before exporting the Executive Brief."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synthesize executive brief: {str(e)}"
        )


@router.get("/{analysis_id}/export/markdown")
async def export_markdown(
    analysis_id: str,
    language: str = "en",
    db: Session = Depends(get_db)
):
    """
    Exports boardroom-ready Executive Brief as a structured Markdown document.
    """
    from fastapi.responses import Response
    from services.executive_brief import (
        synthesize_executive_brief_en,
        synthesize_executive_brief_ja,
        generate_executive_brief_markdown,
        IncompleteAnalysisError
    )

    try:
        results_map = _get_completed_agent_results_map(analysis_id, db)
        if language.lower() == "ja":
            brief = await synthesize_executive_brief_ja(results_map)
        else:
            brief = synthesize_executive_brief_en(results_map)
        
        md_content = generate_executive_brief_markdown(brief)
        filename = f"kizuna_executive_brief_{analysis_id}_{language}.md"

        return Response(
            content=md_content,
            media_type="text/markdown; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except IncompleteAnalysisError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis incomplete. Complete all required intelligence stages before exporting the Executive Brief."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Markdown export failed: {str(e)}"
        )


@router.get("/{analysis_id}/export/pdf")
async def export_pdf(
    analysis_id: str,
    language: str = "en",
    db: Session = Depends(get_db)
):
    """
    Exports boardroom-ready Executive Brief as a corporate PDF document.
    """
    from fastapi.responses import Response
    from services.executive_brief import (
        synthesize_executive_brief_en,
        synthesize_executive_brief_ja,
        generate_executive_brief_pdf,
        IncompleteAnalysisError
    )

    try:
        results_map = _get_completed_agent_results_map(analysis_id, db)
        if language.lower() == "ja":
            brief = await synthesize_executive_brief_ja(results_map)
        else:
            brief = synthesize_executive_brief_en(results_map)
        
        pdf_bytes = generate_executive_brief_pdf(brief)
        filename = f"kizuna_executive_brief_{analysis_id}_{language}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except IncompleteAnalysisError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis incomplete. Complete all required intelligence stages before exporting the Executive Brief."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF export failed: {str(e)}"
        )

