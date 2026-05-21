from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.concurrency import run_in_threadpool
import logging

from fastapi_pagination import add_pagination
from app.core.config import settings
from app.scripts.create_admin import create_default_admin
from app.scripts.seeds import init_db
from app.core.scheduler import scheduler, setup_scheduler

from app.api.v1 import (
    auth,
    animals,
    admin_users,
    favorite_animals,
    surveys,
    trivia,
    vendp,
    inventario_admin,
    transacciones,
    alimentacion,
    tareas,
    veterinario,
    dashboards,
    reportes,
    onboarding,
    permissions,
    roles,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando ZooConnect API")

    logger.info("Verificando datos semilla")
    await run_in_threadpool(init_db)

    logger.info("Verificando usuario administrador")
    await run_in_threadpool(create_default_admin)

    logger.info("Iniciando Scheduler")
    setup_scheduler()

    logger.info("Verificacion exitosa")

    yield

    logger.info("Apagando ZooConnect")
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler detenido")
    logger.info("ZooConnect API detenida")


app = FastAPI(
    title="ZooConnect API",
    lifespan=lifespan,
    description="API para la gestion de un zoologico",
    version="5.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "https://vercel-zoo-connect.vercel.app",
        "https://vercel-zoo-connect-git-main-mfjm0265-7988s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/zooconnect/auth", tags=["auth"])
app.include_router(admin_users.router, prefix="/zooconnect/admin_users", tags=["admin"])
app.include_router(
    permissions.router,
    prefix="/zooconnect/admin_users/permissions",
    tags=["permissions"],
)
app.include_router(roles.router, prefix="/zooconnect/admin_roles", tags=["roles"])
app.include_router(animals.router, prefix="/zooconnect/animals")
app.include_router(surveys.router, prefix="/zooconnect/surveys")
app.include_router(trivia.router, prefix="/zooconnect/trivia", tags=["trivia"])
app.include_router(favorite_animals.router, prefix="/zooconnect/favorite_animals")
app.include_router(
    vendp.router, prefix="/zooconnect/security", tags=["Seguridad"]
)
app.include_router(
    inventario_admin.router,
    prefix="/zooconnect/inventario",
    tags=["Inventario"],
)
app.include_router(
    transacciones.router,
    prefix="/zooconnect/transacciones",
    tags=["Entradas y salidas de inventario"],
)
app.include_router(
    alimentacion.router, prefix="/zooconnect/alimentacion", tags=["Alimentacion"]
)
app.include_router(tareas.router, prefix="/zooconnect/tareas", tags=["Tareas"])
app.include_router(
    veterinario.router, prefix="/zooconnect/veterinario", tags=["Veterinario"]
)
app.include_router(dashboards.router, prefix="/zooconnect/dashboards", tags=["Dashboards"])
app.include_router(reportes.router, prefix="/zooconnect/reportes", tags=["Reportes"])
app.include_router(
    onboarding.router, prefix="/zooconnect/onboarding", tags=["Onboarding"]
)

add_pagination(app)
