import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.schema.analysis_schema import RandomnessRequest
from app.schema.experiment_schema import ExperimentRequest

from app.services.quantum_service import generate_qubits
from app.services.classical_rng_service import generate_classical_bits
from app.services.analysis_service import run_experiment

from app.db.session import get_db
from app.model.random_experiment import RandomExperiment

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from app.utils.randomness_tests import (
    frequency_test,
    entropy_test,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze-randomness")
async def analyze_randomness(data: RandomnessRequest):
    try:
        if data.sample_size > 1_000_000:
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None, "error": "Sample size too large. Max allowed = 1,000,000"}
            )

        bits = generate_qubits(data.sample_size)

        frequency = frequency_test(bits)
        entropy = entropy_test(bits)

        return {
            "success": True,
            "data": {
                "generated_bits": bits,
                "frequency_test": frequency,
                "entropy_test": entropy
            },
            "error": None
        }
    except Exception:
        logger.exception("analyze_randomness failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )


@router.post("/run-experiment")
async def run_experiment_endpoint(request: Request):
    try:
        payload = {}
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                payload = await request.json()
            except Exception:
                payload = {}

        generator = payload.get("generator") if isinstance(payload, dict) else None
        sample_size = payload.get("sample_size") if isinstance(payload, dict) else None

        if generator is None:
            generator = request.query_params.get("generator")
        if sample_size is None:
            sample_size = request.query_params.get("sample_size")

        if generator is None or sample_size is None:
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None, "error": "Missing generator or sample_size"}
            )

        sample_size = int(sample_size)

        if generator == "quantum":
            bits = generate_qubits(sample_size)
        elif generator == "simulator":
            bits = generate_qubits(sample_size)
        elif generator == "classical":
            bits = generate_classical_bits(sample_size)
        else:
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None, "error": "Invalid generator type"}
            )

        zeros = str(bits).count("0")
        ones = str(bits).count("1")
        entropy = entropy_test(bits)

        return {
            "success": True,
            "data": {
                "generator": generator,
                "sample_size": sample_size,
                "zeros": zeros,
                "ones": ones,
                "entropy": entropy
            },
            "error": None
        }
    except Exception:
        logger.exception("run_experiment_endpoint failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )


@router.post("/run-experiment-db")
def run_experiment_db(
    data: ExperimentRequest,
    db: Session = Depends(get_db)
):
    try:
        result = run_experiment(data.generator, data.sample_size)

        experiment = RandomExperiment(
            generator=data.generator,
            sample_size=data.sample_size,
            zeros=result["zeros"],
            ones=result["ones"],
            entropy=result["entropy"],
            chi_square=result.get("chi_square")
        )

        db.add(experiment)
        db.commit()
        db.refresh(experiment)

        return {
            "success": True,
            "data": result,
            "error": None
        }
    except Exception:
        db.rollback()
        logger.exception("run_experiment_db failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )

@router.get("/experiments")
def get_experiments(db: Session = Depends(get_db)):
    try:
        experiments = db.query(RandomExperiment).all()
        return {
            "success": True,
            "data": experiments,
            "error": None
        }
    except Exception:
        logger.exception("get_experiments failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )

@router.get("/experiment/{experiment_id}")
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    try:
        experiment = db.query(RandomExperiment).filter(
            RandomExperiment.id == experiment_id
        ).first()

        if not experiment:
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Experiment not found"}
            )

        return {
            "success": True,
            "data": experiment,
            "error": None
        }
    except Exception:
        logger.exception("get_experiment failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": "Internal server error"}
        )