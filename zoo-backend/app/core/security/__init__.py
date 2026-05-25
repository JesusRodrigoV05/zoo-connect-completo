from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


legacy_path = Path(__file__).resolve().parents[1] / "security.py"
_spec = spec_from_file_location("app.core.security_legacy_impl", legacy_path)
if _spec is None or _spec.loader is None:
    raise ImportError(f"No se pudo cargar el módulo legado: {legacy_path}")

_legacy_module = module_from_spec(_spec)
_spec.loader.exec_module(_legacy_module)

for _name in dir(_legacy_module):
    if not _name.startswith("__"):
        globals()[_name] = getattr(_legacy_module, _name)

from .publisher import publish_security_event

__all__ = [name for name in globals() if not name.startswith("__")]
