
from fastapi import APIRouter
router = APIRouter()

@router.post("/sweep")
async def trigger_sweep():
    pass
