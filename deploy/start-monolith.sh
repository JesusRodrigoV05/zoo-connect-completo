#!/bin/sh
set -eu

backend_port="${BACKEND_PORT:-8000}"
frontend_port="${PORT:-4200}"

export PYTHONPATH="${PYTHONPATH:-/app/backend}"
export BACKEND_INTERNAL_URL="${BACKEND_INTERNAL_URL:-http://127.0.0.1:${backend_port}/zooconnect}"
export PORT="$frontend_port"

cd /app/backend
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port "$backend_port" &
backend_pid=$!

cd /app/frontend
node dist/zoo-connect-web/server/server.mjs &
frontend_pid=$!

stop_processes() {
  kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" "$frontend_pid" 2>/dev/null || true
}

trap stop_processes INT TERM

while true; do
  if ! kill -0 "$backend_pid" 2>/dev/null; then
    wait "$backend_pid" || true
    stop_processes
    exit 1
  fi

  if ! kill -0 "$frontend_pid" 2>/dev/null; then
    wait "$frontend_pid"
    status=$?
    stop_processes
    exit "$status"
  fi

  sleep 2
done
