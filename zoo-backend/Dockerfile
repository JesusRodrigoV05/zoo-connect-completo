FROM python:3.10-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV XDG_CACHE_HOME=/app/.cache
ENV FONTCONFIG_PATH=/etc/fonts
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
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN addgroup --system appuser && adduser --system --ingroup appuser appuser
COPY --chown=appuser:appuser . .
RUN mkdir -p /app/temp_keys /app/.cache/fontconfig \
    && chown appuser:appuser /app/temp_keys /app/.cache /app/.cache/fontconfig \
    && chmod 700 /app/temp_keys
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
