import sys
import os

# Agregar la ruta de las librerías del entorno virtual nuevo de la app
site_packages = os.path.abspath(".venv_new/Lib/site-packages")
if os.path.exists(site_packages):
    sys.path.insert(0, site_packages)

import requests

url_no_slash = "https://zoo-connect.onrender.com/zooconnect/animals/habitats?page=1&size=10"
url_slash = "https://zoo-connect.onrender.com/zooconnect/animals/habitats/?page=1&size=10"

print(f"Haciendo GET a {url_no_slash} (SIN SLASH)...")
try:
    r1 = requests.get(url_no_slash, timeout=10)
    print(f"  Status Code: {r1.status_code}")
    print(f"  Body: {r1.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

print(f"\nHaciendo GET a {url_slash} (CON SLASH)...")
try:
    r2 = requests.get(url_slash, timeout=10)
    print(f"  Status Code: {r2.status_code}")
    print(f"  Body: {r2.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")
