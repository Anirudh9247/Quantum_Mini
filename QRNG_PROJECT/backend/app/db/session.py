import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.model.base import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./qrng.db")

# Cloud SQL (PostgreSQL) via Cloud Run uses the unix socket connector.
# When DATABASE_URL starts with postgres://, SQLAlchemy needs postgresql+psycopg2://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

# Ensure parent directory exists for SQLite (local dev only)
if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

# connect_args only needed for SQLite (thread-safety); not for PostgreSQL
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy.orm import Session
from fastapi import Depends


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()