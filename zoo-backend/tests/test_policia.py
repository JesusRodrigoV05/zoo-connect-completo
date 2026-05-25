import pytest

from app.core import policia


class BrokenPipeline:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def incr(self, *args, **kwargs):
        raise ConnectionError("redis down")

    async def expire(self, *args, **kwargs):
        raise ConnectionError("redis down")

    async def execute(self):
        raise ConnectionError("redis down")


class BrokenRedis:
    def pipeline(self):
        return BrokenPipeline()

    async def get(self, *args, **kwargs):
        raise ConnectionError("redis down")

    async def delete(self, *args, **kwargs):
        raise ConnectionError("redis down")


@pytest.mark.asyncio
async def test_policia_handles_redis_disconnects():
    cache = BrokenRedis()

    await policia.increment_login_failure("user@example.com", cache)
    assert await policia.get_login_failures("user@example.com", cache) == 0
    await policia.clear_login_failures("user@example.com", cache)
