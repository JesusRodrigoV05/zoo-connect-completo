#!/bin/sh
set -e

alembic upgrade head

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port ${PORT:-8000} \
  --workers ${UVICORN_WORKERS:-$(nproc 2>/dev/null || echo 4)}
