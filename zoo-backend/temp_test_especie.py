import sys
import os

# Sobrescribir la base de datos para usar el puerto expuesto del contenedor local (5435)
os.environ["DATABASE_URL"] = "postgresql+psycopg2://postgres:admin@127.0.0.1:5435/ZOOCONNECT"

# Agregar la ruta de las librerías del entorno virtual nuevo de la app
site_packages = os.path.abspath(".venv_new/Lib/site-packages")
if os.path.exists(site_packages):
    sys.path.insert(0, site_packages)
else:
    print(f"Ruta no existe: {site_packages}")

# Añadir el directorio base de la app al PYTHONPATH
sys.path.append(os.path.abspath("."))

from app.db.session import SessionLocal
from app.models.animal import Especie

print("Intentando compilar el mapper de Especie realizando una consulta...")
db = SessionLocal()
try:
    # Esta consulta forzará la compilación del mapper en SQLAlchemy
    especie = db.query(Especie).first()
    print("¡Consulta exitosa!")
    if especie:
        print(f"Especie encontrada: {especie.nombre_cientifico} ({especie.nombre_especie})")
    else:
        print("No hay especies registradas en la base de datos.")
except Exception as e:
    import traceback
    print("¡Error detectado!")
    traceback.print_exc()
finally:
    db.close()
