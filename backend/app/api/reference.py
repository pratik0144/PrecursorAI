
from fastapi import APIRouter
router = APIRouter()

@router.get("/iogp_rules")
async def get_rules():
    pass
