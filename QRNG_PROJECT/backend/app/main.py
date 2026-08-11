import matplotlib
matplotlib.use("Agg")
import os
os.makedirs("static/plots", exist_ok=True)

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
from app.api.analysis import router as analysis_router
from app.api.comparision import router as comparison_router
from app.db.session import engine
from app.model.random_experiment import Base

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Secure QRNG API")

@app.on_event("startup")
def startup_event():
    print("[QRNG API] App started successfully")

# --- CORS ---
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
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