import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship
from core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    company_name_jp = Column(String(255), nullable=False)
    target_sector = Column(String(100), nullable=False)
    status = Column(String(50), default="draft")  # draft, analyzing, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    product_briefs = relationship("ProductBrief", back_populates="project", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="project", cascade="all, delete-orphan")

class ProductBrief(Base):
    __tablename__ = "product_briefs"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    value_proposition = Column(Text, nullable=True)
    target_customer_profile = Column(Text, nullable=True)
    pricing_model_jpy = Column(String(100), nullable=True)
    technical_specifications = Column(JSON, nullable=True)
    competitive_moat = Column(Text, nullable=True)
    raw_brief_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="product_briefs")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    stage = Column(String(50), default="brief")  # brief, market_lens, competitor_map, partner_match, red_team, launch_plan
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    current_agent = Column(String(100), default="BriefExtractorAgent")
    progress = Column(Integer, default=0)  # 0 to 100
    result_data = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="analysis_runs")
    agent_results = relationship("AgentResult", back_populates="analysis_run", cascade="all, delete-orphan")

class AgentResult(Base):
    __tablename__ = "agent_results"

    id = Column(String(36), primary_key=True, index=True)
    analysis_run_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, failed
    input_summary = Column(Text, nullable=True)
    output_json = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    analysis_run = relationship("AnalysisRun", back_populates="agent_results")
