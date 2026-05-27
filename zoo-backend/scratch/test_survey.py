import sys
import os

# Sobrescribir la base de datos para usar el puerto expuesto del contenedor local (5435)
os.environ["DATABASE_URL"] = "postgresql+psycopg2://postgres:admin@127.0.0.1:5435/ZOOCONNECT"

# Agregar la ruta de las librerías del entorno virtual nuevo de la app
site_packages = os.path.abspath(".venv_new/Lib/site-packages")
if os.path.exists(site_packages):
    sys.path.insert(0, site_packages)

# Añadir el directorio base de la app al PYTHONPATH
sys.path.append(os.path.abspath("."))

from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.crud import survey as crud_survey
from app.schemas.survey import EncuestaCreate, PreguntaEncuestaCreate, OpcionEncuestaCreate

db = SessionLocal()
try:
    print("Creando payload para simular la creación de encuesta...")
    survey_data = EncuestaCreate(
        titulo="Evaluación de Experiencia - Charla de Grandes Felinos",
        descripcion="Esta encuesta busca conocer la satisfacción de los visitantes tras asistir a la charla educativa.",
        fecha_inicio=datetime.now(timezone.utc),
        fecha_fin=datetime.now(timezone.utc),
        preguntas=[
            PreguntaEncuestaCreate(
                texto_pregunta="¿Qué tal estuvo la charla?",
                es_opcion_unica=True,
                orden=1,
                opciones=[
                    OpcionEncuestaCreate(texto_opcion="Excelente", orden=1),
                    OpcionEncuestaCreate(texto_opcion="Bueno", orden=2),
                    OpcionEncuestaCreate(texto_opcion="Regular", orden=3),
                ]
            )
        ]
    )
    
    print("Iniciando creación en la base de datos...")
    # Buscamos un ID de usuario real de la base de datos
    from app.models.user import User
    user = db.query(User).first()
    if not user:
        raise Exception("No hay usuarios en la base de datos para realizar la prueba")
    
    print(f"Utilizando usuario de prueba ID: {user.id}")
    encuesta = crud_survey.create_encuesta(db, survey_data, usuario_id=user.id)
    print("¡Éxito! Encuesta creada exitosamente.")
    print(f"ID Encuesta: {encuesta.id_encuesta}, Título: {encuesta.titulo}")
except Exception as e:
    import traceback
    print("¡Error capturado!")
    traceback.print_exc()
finally:
    db.close()
