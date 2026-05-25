import importlib


def test_app_imports_without_weasyprint_native_dependency():
    app_module = importlib.import_module("app.main")

    assert app_module.app.title == "ZooConnect API"
