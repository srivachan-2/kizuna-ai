from fastapi import APIRouter
from services.market_service import market_service

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/sectors")
def get_sectors():
    """Retrieve curated India-Japan bilateral high-growth sectors."""
    return market_service.get_sectors()

@router.get("/regulations")
def get_regulations():
    """Retrieve regulatory intelligence frameworks."""
    return market_service.get_regulations()
