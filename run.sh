#!/usr/bin/env bash

# --- Configuration ---
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# --- UI Helpers ---
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

function log() {
    echo -e "${BLUE}[SYSTEM]${NC} $1"
}

function success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# --- Initialization ---
log "Starting Market Analyst AI Bootstrap..."

# 1. Check Backend
if [ ! -f "$BACKEND_DIR/.env" ]; then
    log "Configuring backend (copying .env.example)..."
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

# 2. Run Options
case "$1" in
    "backend")
        log "Starting Backend Service..."
        cd "$BACKEND_DIR" && python3 main.py
        ;;
    "frontend")
        log "Starting Frontend Application..."
        cd "$FRONTEND_DIR" && npm run dev
        ;;
    *)
        log "Usage: ./run.sh [backend|frontend]"
        log "Hint: Use 'docker-compose up' to run the full stack."
        exit 1
        ;;
esac
