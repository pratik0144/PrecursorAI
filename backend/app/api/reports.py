
from fastapi import APIRouter
router = APIRouter()

@router.post("/")
async def create_report():
    pass

@router.get("/")
async def list_reports():
    pass
