FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY zoo-frontend/package*.json ./
RUN npm ci
COPY zoo-frontend/ ./
RUN npm run build -- --configuration production

FROM node:22-bookworm-slim AS node-runtime

FROM python:3.10-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend
ENV XDG_CACHE_HOME=/app/backend/.cache
ENV FONTCONFIG_PATH=/etc/fonts
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:8000/zooconnect

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       python3-dev \
       libc6-dev \
       libpango-1.0-0 \
       libpangoft2-1.0-0 \
       libharfbuzz-subset0 \
       libjpeg-dev \
       libopenjp2-7-dev \
       libffi-dev \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules

COPY zoo-backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY zoo-backend/ /app/backend/
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY deploy/start-monolith.sh /app/start-monolith.sh

RUN addgroup --system appuser \
    && adduser --system --ingroup appuser appuser \
    && mkdir -p /app/backend/temp_keys /app/backend/.cache/fontconfig /app/backend/media \
    && chown -R appuser:appuser /app \
    && chmod 700 /app/backend/temp_keys \
    && chmod 755 /app/start-monolith.sh

USER appuser
EXPOSE 4200
CMD ["sh", "/app/start-monolith.sh"]
