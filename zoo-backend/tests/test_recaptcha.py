import asyncio

from app.core import recaptcha


def test_is_valid_recaptcha_true():
    result = {"success": True}
    assert recaptcha.is_valid_recaptcha(result) is True


def test_is_valid_recaptcha_false():
    result = {"success": False}
    assert recaptcha.is_valid_recaptcha(result) is False


def test_verify_recaptcha_calls_google(monkeypatch):
    class DummySettings:
        RECAPTCHA_SECRET_KEY = "real-secret"
        RECAPTCHA_VERIFY_URL = "https://recaptcha.example/verify"

    monkeypatch.setattr(recaptcha, "settings", DummySettings)

    class DummyResponse:
        def json(self):
            return {"success": True, "hostname": "localhost", "error-codes": []}

    class DummyClient:
        def __init__(self, timeout):
            self.timeout = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, data):
            assert url == DummySettings.RECAPTCHA_VERIFY_URL
            assert data["secret"] == DummySettings.RECAPTCHA_SECRET_KEY
            assert data["response"] == "anytoken"
            return DummyResponse()

    monkeypatch.setattr(recaptcha.httpx, "AsyncClient", DummyClient)

    res = asyncio.run(recaptcha.verify_recaptcha("anytoken"))
    assert isinstance(res, dict)
    assert res.get("success") is True
