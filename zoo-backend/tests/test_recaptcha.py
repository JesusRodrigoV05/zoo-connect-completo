import asyncio

from app.core import recaptcha


def test_is_valid_recaptcha_true():
    result = {"success": True}
    assert recaptcha.is_valid_recaptcha(result) is True


def test_is_valid_recaptcha_false():
    result = {"success": False}
    assert recaptcha.is_valid_recaptcha(result) is False


def test_verify_recaptcha_dev_mode(monkeypatch):
    # Ensure that when RECAPTCHA_SECRET_KEY is the placeholder, verification returns success
    class DummySettings:
        RECAPTCHA_SECRET_KEY = "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx"

    monkeypatch.setattr(recaptcha, "settings", DummySettings)

    res = asyncio.run(recaptcha.verify_recaptcha("anytoken"))
    assert isinstance(res, dict)
    assert res.get("success") is True
