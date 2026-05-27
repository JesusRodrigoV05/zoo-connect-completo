# Plan: Rebuild and Verify Project

## Objective
Rebuild the entire project using Docker Compose, ensure the database is up-to-date with migrations, and verify that all services (Backend, Frontend, DB, Redis) are stable and running correctly.

## Implementation Steps

1.  **Stop Existing Containers & Clean Volumes**
    - Run `docker-compose down -v` to stop containers and remove old volumes (ensuring a fresh database and redis state). *Note: This will erase local database data. We will confirm with the user before proceeding.*

2.  **Build and Start Services**
    - Run `docker-compose up --build -d` to rebuild the images and start the services in the background.

3.  **Wait for Stability & Initialization**
    - Make waits to ensure Postgres and Redis are fully ready.
    - The backend `lifespan` event will automatically run `init_db` and `create_default_admin`.
    - Apply Alembic migrations manually inside the backend container to ensure the schema is completely up-to-date: `docker-compose exec backend alembic upgrade head`.

4.  **Verification & Health Checks**
    - Check the logs of the `backend` and `frontend` containers to ensure there are no startup errors.
    - Send HTTP requests to verify the services are responding:
      - Backend: `curl -I http://localhost:8000/docs`
      - Frontend: `curl -I http://localhost:4200`
    - Run backend tests to ensure the application logic is stable: `docker-compose exec backend pytest`.

## Verification & Testing
- Container status: All containers must be "Up" (no "Exited").
- Migration status: `alembic current` should match the latest migration file.
- Application status: Both ports 8000 and 4200 must be accessible.
- Tests: Pytest must pass.