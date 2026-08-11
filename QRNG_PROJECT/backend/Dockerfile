# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS builder

# System deps required by Qiskit-Aer (C/C++ compiled extensions) & matplotlib
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies first (layer-cached unless requirements change)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ────────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm

# Runtime system lib for OpenMP (needed by Qiskit-Aer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source
COPY . .

# Create the static/plots directory (matplotlib saves plots here)
RUN mkdir -p static/plots

# Cloud Run injects PORT env var (default 8080); local dev fallback to 8000
EXPOSE 8080

# Start uvicorn — Cloud Run sets $PORT to 8080 automatically
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
