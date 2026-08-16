import logging

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.services.analysis_service import compare_rng

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/comparison", tags=["Comparison"])


@router.post("/compare-rng")
async def compare_random_generators(request: Request):
    try:
        payload = {}
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                payload = await request.json()
            except Exception:
                payload = {}

        sample_size = payload.get("sample_size") if isinstance(payload, dict) else None
        if sample_size is None:
            sample_size = request.query_params.get("sample_size")
        if sample_size is None:
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None, "error": "Missing sample_size"}
            )

        result = compare_rng(int(sample_size))
        return {
            "success": True,
            "data": result,
            "error": None
        }
    except Exception:
        logger.exception("compare_random_generators failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )