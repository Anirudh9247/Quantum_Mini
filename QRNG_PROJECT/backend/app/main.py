import logging
import os

# pyrefly: ignore [missing-import]
import matplotlib
# pyrefly: ignore [missing-import]
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

import secrets

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Secure QRNG API")

PUBLIC_PATHS = {"/health", "/", "/docs", "/openapi.json", "/redoc"}


@app.middleware("http")
async def enforce_api_key(request: Request, call_next):
    # Allow CORS preflight requests
    if request.method == "OPTIONS":
        return await call_next(request)

    # Allow public endpoints and static assets
    if request.url.path in PUBLIC_PATHS or request.url.path.startswith("/static"):
        return await call_next(request)

    api_key = os.getenv("API_KEY")
    env = os.getenv("ENVIRONMENT", os.getenv("ENV", "development")).lower()
    require_key = os.getenv("REQUIRE_API_KEY", "false").lower() in {"true", "1", "yes"}
    is_production = env in {"production", "prod", "staging"} or os.getenv("K_SERVICE") is not None or require_key

    # If API_KEY is set in environment, validate incoming credentials
    if api_key:
        header_key = request.headers.get("x-api-key")
        bearer = request.headers.get("authorization", "")
        token = None

        if bearer.startswith("Bearer "):
            token = bearer.split(" ", 1)[1].strip()
        elif header_key:
            token = header_key.strip()

        if not token or not secrets.compare_digest(token, api_key):
            logger.warning("Blocked unauthorized API request to %s", request.url.path)
            return JSONResponse(
                status_code=401,
                content={"success": False, "data": None, "error": "Unauthorized"},
            )
    elif is_production:
        # Fail closed in production/staging if API_KEY is missing
        logger.error("API_KEY is not configured in %s environment. Blocking request to %s", env, request.url.path)
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": "Unauthorized - API key not configured"},
        )
    else:
        logger.warning("Running without API_KEY in development mode for %s", request.url.path)

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