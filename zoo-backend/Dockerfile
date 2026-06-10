FROM python:3.14-slim AS build
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
COPY requirements.txt requirements-test.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-test.txt

FROM python:3.14-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
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
COPY --from=build /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=build /usr/local/bin /usr/local/bin
COPY . .
RUN useradd -m appuser && chown -R appuser /app
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
