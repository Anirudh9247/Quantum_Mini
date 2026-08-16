#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# QRNG Interactive — Google Cloud Run Deployment Script
#
# Prerequisites:
#   1. gcloud CLI installed and authenticated:  gcloud auth login
#   2. Project set:  gcloud config set project YOUR_PROJECT_ID
#   3. APIs enabled (run once):
#        gcloud services enable \
#          run.googleapis.com \
#          cloudbuild.googleapis.com \
#          secretmanager.googleapis.com \
#          artifactregistry.googleapis.com \
#          sqladmin.googleapis.com
#
# Usage:
#   ./deploy-cloudrun.sh YOUR_PROJECT_ID us-central1
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${1:?Usage: ./deploy-cloudrun.sh PROJECT_ID [REGION]}"
REGION="${2:-us-central1}"
SERVICE_NAME="qrng-api"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "▶ Building and pushing Docker image to GCR..."
gcloud builds submit \
  --project="${PROJECT_ID}" \
  --tag="${IMAGE}:latest" \
  ./backend

echo "▶ Deploying to Cloud Run (region: ${REGION})..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --image="${IMAGE}:latest" \
  --region="${REGION}" \
  --platform=managed \
  --memory=2Gi \
  --cpu=2 \
  --timeout=120 \
  --max-instances=3 \
  --port=8080 \
  --set-secrets="DATABASE_URL=qrng-database-url:latest,ALLOWED_ORIGINS=qrng-allowed-origins:latest,API_KEY=qrng-api-key:latest"

echo ""
echo "✅ Deployment complete!"
echo "   Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --format="value(status.url)"

echo ""
echo "▶ Verifying /health endpoint..."
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --format="value(status.url)")

curl -sf "${SERVICE_URL}/health" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Health:', d)"
