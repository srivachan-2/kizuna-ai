import uuid
import datetime
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.project import Project, ProductBrief, AnalysisRun, AgentResult
from agents.brief_extractor import BriefExtractorAgent
from agents.market_lens import MarketLensAgent
from agents.competitor import CompetitorAgent
from agents.partner_match import PartnerMatchAgent
from agents.red_team import RedTeamAgent
from agents.action_planner import ActionPlannerAgent
from agents.schemas import AgentExecutionOutput

logger = logging.getLogger("kizuna.orchestrator")

class AgentOrchestrator:
    """
    Central Intelligence Pipeline Orchestrator for KIZUNA AI.
    Executes sequential 6-stage agent pipeline:
    1. BriefExtractorAgent (16%)
    2. MarketLensAgent (33%)
    3. CompetitorAgent (50%)
    4. PartnerMatchAgent (66%)
    5. RedTeamAgent (83%)
    6. ActionPlannerAgent (100%)
    """
    def __init__(self):
        # Register Phase 2A, 2B, 2C, 2D agents
        self.brief_extractor = BriefExtractorAgent()
        self.market_lens_agent = MarketLensAgent()
        self.competitor_agent = CompetitorAgent()
        self.partner_match_agent = PartnerMatchAgent()
        self.red_team_agent = RedTeamAgent()
        self.action_planner_agent = ActionPlannerAgent()
        self._cancelled_runs: set = set()

    def cancel_pipeline(self, run_id: str):
        self._cancelled_runs.add(run_id)

    def _is_cancelled(self, db: Session, run_id: str) -> bool:
        if run_id in self._cancelled_runs:
            return True
        run = db.query(AnalysisRun).filter(AnalysisRun.id == run_id).first()
        if run and run.status == "cancelled":
            return True
        return False

    async def run_pipeline(
        self,
        db: Session,
        project_id: str,
        initial_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes the Phase 2D 6-Stage Sequential Pipeline:
        1. BriefExtractorAgent (16%)
        2. MarketLensAgent (33%)
        3. CompetitorAgent (50%)
        4. PartnerMatchAgent (66%)
        5. RedTeamAgent (83%)
        6. ActionPlannerAgent (100%)
        """
        # Find or create AnalysisRun
        analysis_run = db.query(AnalysisRun).filter(
            AnalysisRun.project_id == project_id
        ).order_by(AnalysisRun.created_at.desc()).first()

        if not analysis_run:
            analysis_run = AnalysisRun(
                id=str(uuid.uuid4()),
                project_id=project_id,
                stage="brief",
                status="pending",
                current_agent="BriefExtractorAgent",
                progress=0,
                created_at=datetime.datetime.utcnow()
            )
            db.add(analysis_run)
            db.commit()
            db.refresh(analysis_run)

        analysis_run.status = "running"
        analysis_run.started_at = datetime.datetime.utcnow()
        db.commit()

        pipeline_context: Dict[str, Any] = dict(initial_context)
        results_by_agent: Dict[str, Any] = {}

        # -------------------------------------------------------------
        # STAGE 1: Brief Extraction Agent (Progress -> 16%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 1: Running BriefExtractorAgent...")
        analysis_run.stage = "brief"
        analysis_run.current_agent = "BriefExtractorAgent"
        analysis_run.progress = 14
        db.commit()

        brief_out: AgentExecutionOutput = await self.brief_extractor.execute(pipeline_context)
        
        # Persist Stage 1 AgentResult
        res1 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="BriefExtractorAgent",
            status=brief_out.status,
            input_summary=brief_out.input_summary,
            output_json=brief_out.data,
            confidence=brief_out.confidence,
            error_message=brief_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res1)
        db.commit()

        if brief_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"BriefExtractorAgent failed: {brief_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "BriefExtractorAgent", "error": brief_out.error}

        results_by_agent["brief"] = brief_out.data
        pipeline_context["brief"] = brief_out.data
        analysis_run.progress = 16
        db.commit()

        # -------------------------------------------------------------
        # STAGE 2: Market Lens Agent (Progress -> 33%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 2: Running MarketLensAgent...")
        analysis_run.stage = "market_lens"
        analysis_run.current_agent = "MarketLensAgent"
        analysis_run.progress = 29
        db.commit()

        market_out: AgentExecutionOutput = await self.market_lens_agent.execute(pipeline_context)

        # Persist Stage 2 AgentResult
        res2 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="MarketLensAgent",
            status=market_out.status,
            input_summary=market_out.input_summary,
            output_json=market_out.data,
            confidence=market_out.confidence,
            error_message=market_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res2)
        db.commit()

        if market_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"MarketLensAgent failed: {market_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "MarketLensAgent", "error": market_out.error}

        results_by_agent["market_lens"] = market_out.data
        pipeline_context["market_lens"] = market_out.data
        analysis_run.progress = 33
        db.commit()

        # -------------------------------------------------------------
        # STAGE 3: Competitor Agent (Progress -> 50%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 3: Running CompetitorAgent...")
        analysis_run.stage = "competitor_map"
        analysis_run.current_agent = "CompetitorAgent"
        analysis_run.progress = 43
        db.commit()

        comp_out: AgentExecutionOutput = await self.competitor_agent.execute(pipeline_context)

        # Persist Stage 3 AgentResult
        res3 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="CompetitorAgent",
            status=comp_out.status,
            input_summary=comp_out.input_summary,
            output_json=comp_out.data,
            confidence=comp_out.confidence,
            error_message=comp_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res3)
        db.commit()

        if comp_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"CompetitorAgent failed: {comp_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "CompetitorAgent", "error": comp_out.error}

        results_by_agent["competitor_map"] = comp_out.data
        pipeline_context["competitor_map"] = comp_out.data
        analysis_run.progress = 50
        db.commit()

        # -------------------------------------------------------------
        # STAGE 4: Partner Match Agent (Progress -> 66%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 4: Running PartnerMatchAgent...")
        analysis_run.stage = "partner_match"
        analysis_run.current_agent = "PartnerMatchAgent"
        analysis_run.progress = 57
        db.commit()

        partner_out: AgentExecutionOutput = await self.partner_match_agent.execute(pipeline_context)

        # Persist Stage 4 AgentResult
        res4 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="PartnerMatchAgent",
            status=partner_out.status,
            input_summary=partner_out.input_summary,
            output_json=partner_out.data,
            confidence=partner_out.confidence,
            error_message=partner_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res4)
        db.commit()

        if partner_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"PartnerMatchAgent failed: {partner_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "PartnerMatchAgent", "error": partner_out.error}

        results_by_agent["partner_match"] = partner_out.data
        pipeline_context["partner_match"] = partner_out.data
        analysis_run.progress = 66
        db.commit()

        # -------------------------------------------------------------
        # STAGE 5: Red Team Agent (Progress -> 83%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 5: Running RedTeamAgent...")
        analysis_run.stage = "red_team"
        analysis_run.current_agent = "RedTeamAgent"
        analysis_run.progress = 71
        db.commit()

        red_out: AgentExecutionOutput = await self.red_team_agent.execute(pipeline_context)

        # Persist Stage 5 AgentResult
        res5 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="RedTeamAgent",
            status=red_out.status,
            input_summary=red_out.input_summary,
            output_json=red_out.data,
            confidence=red_out.confidence,
            error_message=red_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res5)
        db.commit()

        if red_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"RedTeamAgent failed: {red_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "RedTeamAgent", "error": red_out.error}

        results_by_agent["red_team"] = red_out.data
        pipeline_context["red_team"] = red_out.data
        analysis_run.progress = 83
        db.commit()

        # -------------------------------------------------------------
        # STAGE 6: Action Planner Agent (Progress -> 100%)
        # -------------------------------------------------------------
        if self._is_cancelled(db, analysis_run.id):
            self._cancelled_runs.discard(analysis_run.id)
            analysis_run.status = "cancelled"
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "cancelled", "analysis_run_id": analysis_run.id, "project_id": project_id, "message": "Pipeline cancelled."}

        logger.info(f"[{project_id}] Stage 6: Running ActionPlannerAgent...")
        analysis_run.stage = "launch_plan"
        analysis_run.current_agent = "ActionPlannerAgent"
        analysis_run.progress = 86
        db.commit()

        action_out: AgentExecutionOutput = await self.action_planner_agent.execute(pipeline_context)

        # Persist Stage 6 AgentResult
        res6 = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="ActionPlannerAgent",
            status=action_out.status,
            input_summary=action_out.input_summary,
            output_json=action_out.data,
            confidence=action_out.confidence,
            error_message=action_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res6)
        db.commit()

        if action_out.status != "completed":
            analysis_run.status = "failed"
            analysis_run.result_data = {"error": f"ActionPlannerAgent failed: {action_out.error}"}
            analysis_run.completed_at = datetime.datetime.utcnow()
            db.commit()
            return {"status": "failed", "failed_agent": "ActionPlannerAgent", "error": action_out.error}

        results_by_agent["action_plan"] = action_out.data
        analysis_run.status = "completed"
        analysis_run.progress = 100
        analysis_run.result_data = results_by_agent
        analysis_run.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(analysis_run)

        return {
            "analysis_run_id": analysis_run.id,
            "project_id": project_id,
            "status": "completed",
            "progress": 100,
            "current_agent": "ActionPlannerAgent",
            "results": results_by_agent
        }

    async def run_brief_extraction(
        self,
        db: Session,
        project_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Backward compatibility for Phase 2A single-agent runner."""
        analysis_run = db.query(AnalysisRun).filter(
            AnalysisRun.project_id == project_id
        ).order_by(AnalysisRun.created_at.desc()).first()

        if not analysis_run:
            analysis_run = AnalysisRun(
                id=str(uuid.uuid4()),
                project_id=project_id,
                stage="brief",
                status="running",
                current_agent="BriefExtractorAgent",
                progress=0,
                created_at=datetime.datetime.utcnow(),
                started_at=datetime.datetime.utcnow()
            )
            db.add(analysis_run)
            db.commit()
            db.refresh(analysis_run)
        else:
            analysis_run.status = "running"
            analysis_run.stage = "brief"
            analysis_run.current_agent = "BriefExtractorAgent"
            analysis_run.started_at = datetime.datetime.utcnow()
            db.commit()

        brief_out = await self.brief_extractor.execute(context)
        res = AgentResult(
            id=str(uuid.uuid4()),
            analysis_run_id=analysis_run.id,
            agent_name="BriefExtractorAgent",
            status=brief_out.status,
            input_summary=brief_out.input_summary,
            output_json=brief_out.data,
            confidence=brief_out.confidence,
            error_message=brief_out.error,
            created_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
        db.add(res)

        analysis_run.status = "completed" if brief_out.status == "completed" else "failed"
        analysis_run.progress = 100
        analysis_run.current_agent = "BriefExtractorAgent"
        analysis_run.result_data = {"brief": brief_out.data} if brief_out.data else {"error": brief_out.error}
        analysis_run.completed_at = datetime.datetime.utcnow()
        db.commit()

        return {
            "analysis_run_id": analysis_run.id,
            "project_id": project_id,
            "status": analysis_run.status,
            "progress": 100,
            "current_agent": "BriefExtractorAgent",
            "results": {"brief": brief_out.data}
        }

orchestrator = AgentOrchestrator()

