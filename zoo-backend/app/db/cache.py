import logging
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    pool = redis.ConnectionPool.from_url(
        settings.redis_connection_url,
        decode_responses=True
    )
    

    cache_client = redis.Redis.from_pool(pool)
    
    logger.info("Conectado a Redis")

except Exception as e:
    logger.error("No se pudo conectar a Redis en %s", settings.redis_connection_url)
    logger.debug("Detalle: %s", e)
    cache_client = None

async def get_cache_client() -> redis.Redis | None:
    return cache_client

async def ping_redis():
    if not cache_client:
        return False
    try:
        await cache_client.ping()
        return True
    except Exception:
        return False
