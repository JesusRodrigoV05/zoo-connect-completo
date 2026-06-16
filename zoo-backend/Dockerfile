FROM python:3.10-slim AS build
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       python3-dev \
       libc6-dev \
       libjpeg-dev \
       libopenjp2-7-dev \
       libffi-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.10-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV XDG_CACHE_HOME=/app/.cache
ENV FONTCONFIG_PATH=/etc/fonts
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq5 \
       libpango-1.0-0 \
       libpangoft2-1.0-0 \
       libharfbuzz-subset0 \
       libjpeg62-turbo \
       libopenjp2-7 \
       libffi8 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=build /usr/local/bin /usr/local/bin
COPY . .
RUN addgroup --system appuser && adduser --system --ingroup appuser appuser \
    && mkdir -p /app/temp_keys /app/.cache/fontconfig \
    && chown -R appuser:appuser /app \
    && chmod 700 /app/temp_keys
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
USER appuser
EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.sh"]
