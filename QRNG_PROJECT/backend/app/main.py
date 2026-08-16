import logging
import os
import secrets

import matplotlib
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

matplotlib.use("Agg")
os.makedirs("static/plots", exist_ok=True)

from app.api.analysis import router as analysis_router
from app.api.comparision import router as comparison_router
from app.db.session import engine
from app.model.random_experiment import Base

load_dotenv()

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Secure QRNG API")
API_KEY = os.getenv("API_KEY")
PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}


def require_api_key() -> bool:
    env_name = os.getenv("ENVIRONMENT", "").strip().lower()
    require_flag = os.getenv("REQUIRE_API_KEY", "").strip().lower()
    return (
        require_flag in {"1", "true", "yes", "on"}
        or env_name == "production"
        or bool(os.getenv("K_SERVICE"))
    )


def get_api_token(request: Request) -> str | None:
    header_key = request.headers.get("x-api-key")
    bearer = request.headers.get("authorization", "")

    if bearer.startswith("Bearer "):
        return bearer.split(" ", 1)[1].strip()
    if header_key:
        return header_key.strip()
    return None


@app.middleware("http")
async def enforce_api_key(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    if path in PUBLIC_PATHS or path.startswith("/static"):
        return await call_next(request)

    if not require_api_key() and not API_KEY:
        return await call_next(request)

    if not API_KEY:
        logger.warning("Blocked protected request because API_KEY is missing in a production-like environment: %s", path)
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": "Unauthorized"},
        )

    token = get_api_token(request)
    if not token or not secrets.compare_digest(token, API_KEY):
        logger.warning("Blocked unauthorized API request to %s", path)
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": "Unauthorized"},
        )

    return await call_next(request)


@app.on_event("startup")
def startup_event():
    print("[QRNG API] App started successfully")


# --- CORS ---
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000",
)
origins_list = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(analysis_router)
app.include_router(comparison_router)


@app.get("/")
def root():
    return {"status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}