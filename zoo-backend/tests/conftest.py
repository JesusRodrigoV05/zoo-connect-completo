import sys
import pathlib

# Ensure project root is on sys.path so 'app' package can be imported during tests
ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
