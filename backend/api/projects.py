import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models.project import Project, ProductBrief

router = APIRouter(prefix="/projects", tags=["Projects"])

# Request/Response Schemas
class ProductBriefCreate(BaseModel):
    product_name: str
    value_proposition: Optional[str] = None
    target_customer_profile: Optional[str] = None
    pricing_model_jpy: Optional[str] = None
    competitive_moat: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    company_name_jp: str
    target_sector: str
    brief: Optional[ProductBriefCreate] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    company_name_jp: str
    target_sector: str
    status: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all market entry analysis projects."""
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new India market entry workspace project."""
    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        name=payload.name,
        company_name_jp=payload.company_name_jp,
        target_sector=payload.target_sector,
        status="draft"
    )
    db.add(project)

    if payload.brief:
        brief = ProductBrief(
            id=str(uuid.uuid4()),
            project_id=project_id,
            product_name=payload.brief.product_name,
            value_proposition=payload.brief.value_proposition,
            target_customer_profile=payload.brief.target_customer_profile,
            pricing_model_jpy=payload.brief.pricing_model_jpy,
            competitive_moat=payload.brief.competitive_moat
        )
        db.add(brief)

    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get project details by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
