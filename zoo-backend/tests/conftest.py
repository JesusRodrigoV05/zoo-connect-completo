import os
import sys

# Forzar variables de entorno para ambiente de pruebas seguro
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DEFAULT_ADMIN_EMAIL"] = "admin@test.com"
os.environ["DEFAULT_ADMIN_PASSWORD"] = "test123"
os.environ["CLOUDINARY_CLOUD_NAME"] = "test"
os.environ["CLOUDINARY_API_KEY"] = "test"
os.environ["CLOUDINARY_API_SECRET"] = "test"
os.environ["MAIL_USERNAME"] = "test@test.com"
os.environ["MAIL_PASSWORD"] = "test"
os.environ["MAIL_FROM"] = "test@test.com"
os.environ["TOTP_ENCRYPTION_KEY"] = "test-key-32chars-xxxxxxxx"

# Asegurar que pytest encuentre la carpeta 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))