import logging
import redis
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.config import settings
from app.core.scheduler_jobs import generar_tareas_diarias

logger = logging.getLogger(__name__)

SCHEDULER_LOCK_KEY = "scheduler:generar_tareas_diarias_lock"
LOCK_TIMEOUT_SECONDS = 60 * 10

scheduler = BackgroundScheduler(timezone=settings.TIMEZONE)

def job_wrapper_generar_tareas():
    redis_client = None
    lock = None
    
    try:
        redis_client = redis.Redis.from_url(
            settings.redis_connection_url,
            decode_responses=True
        )

        lock = redis_client.lock(SCHEDULER_LOCK_KEY, timeout=LOCK_TIMEOUT_SECONDS)
        
        have_lock = lock.acquire(blocking=False)
        
        if have_lock:
            logger.info("[Scheduler] Ejecutando generacion de tareas...")
            try:
                generar_tareas_diarias()
            finally:
                try:
                    lock.release()
                    logger.debug("Bloqueo liberado")
                except redis.exceptions.LockError:
                    logger.warning("No se pudo liberar el bloqueo")
        else:
            logger.info("Bloqueo ocupado. Otro worker esta trabajando sin descanso")
            
    except redis.ConnectionError:
        logger.error("[Scheduler] Error: No se pudo conectar a Redis")
    except Exception as e:
        logger.exception("[Scheduler] Error inesperado en wrapper")
    finally:
        if redis_client:
            redis_client.close()

def setup_scheduler():
    logger.info("Configurando APScheduler...")

    scheduler.add_job(
        job_wrapper_generar_tareas,
        trigger="cron",
        hour=15,
        minute=25,
        id="job_generar_tareas_diarias",
        name="Generar Tareas Recurrentes Diarias",
        replace_existing=True
    )

    if not scheduler.running:
        scheduler.start()
        logger.info("APScheduler iniciado en segundo plano")
