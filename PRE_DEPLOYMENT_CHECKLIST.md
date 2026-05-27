# ✅ PRE-DEPLOYMENT CHECKLIST - ZooConnect

Antes de deployar el proyecto a producción, asegúrate de completar todos estos pasos:

## 🔐 SEGURIDAD

- [ ] Cambiar `SECRET_KEY` por una nueva secuencia aleatoria segura
  ```bash
  # Generar nueva clave (32+ caracteres)
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
  
- [ ] Actualizar `DEFAULT_ADMIN_PASSWORD` con una contraseña segura
  - Mínimo 12 caracteres
  - Incluir mayúsculas, minúsculas, números y símbolos
  
- [ ] Verificar `RECAPTCHA_SECRET_KEY` está actualizado
  - Obtener desde: https://www.google.com/recaptcha/admin
  - Usar credenciales de PRODUCCIÓN, no testing

- [ ] Revisar `POSTMARK_SERVER_TOKEN`
  - Token de servidor en producción (no sandbox)
  - Verificar en: https://account.postmarkapp.com

- [ ] Validar `CLOUDINARY_*` credenciales
  - `CLOUDINARY_API_SECRET` debe estar en servidor, no en cliente
  - Verificar permisos en: https://cloudinary.com/settings

- [ ] Comprobar `TEXTBEE_API_KEY` y `TEXTBEE_DEVICE_ID`
  - Usar credenciales de producción
  - Verificar límites de SMS

## 🗄️ BASE DE DATOS

- [ ] Generar nombre único para base de datos
  - No usar nombres genéricos como "zooconnect"
  - Ejemplo: `zoo_prod_20260527` o similar

- [ ] Crear usuario PostgreSQL dedicado
  - No usar usuario `postgres` en producción
  - Crear usuario con permisos limitados

- [ ] Backup de BD actual (si es migración)
  ```bash
  pg_dump -U postgres -h localhost ZOOCONNECT > backup.sql
  ```

- [ ] Verificar migraciones Alembic
  - Todas las migraciones deben aplicarse sin errores
  - Comando: `alembic upgrade head`

## 🔄 REDIS

- [ ] Crear instancia Redis en producción
  - Usar conexión encriptada si es disponible
  - Configurar política de evicción (`maxmemory-policy`)

- [ ] Verificar credenciales Redis
  - Si tiene contraseña, incluirla en `REDIS_URL`
  - Formato: `redis://[:password]@host:port/db`

## 📧 CORREO

- [ ] Verificar configuración SMTP
  - Usar Postmark recomendado (compatible con Render)
  - NO usar contraseña de Gmail (la app exige "App Password")

- [ ] Realizar prueba de envío de email
  ```python
  # Test desde terminal Python
  from app.core.email_service import send_email
  send_email(
    subject="Test",
    recipients=["tu@email.com"],
    body="Test message"
  )
  ```

- [ ] Configurar remitente de email
  - `MAIL_FROM` debe ser dominio verificado en Postmark
  - `MAIL_FROM_NAME` puede ser "ZooConnect" o similar

## 🌐 CORS & HTTPS

- [ ] Verificar que CORS incluye todas las URLs esperadas
  - Frontend en Vercel: `https://zoo-connect-completo.vercel.app`
  - Dominios custom si los hay
  - NO incluir `*` en producción

- [ ] Confirmar HTTPS en todas las URLs
  - Backend: `https://...` (no http://)
  - Frontend: `https://...`
  - API calls: HTTPS

- [ ] Headers de seguridad configurados
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` presente

## 📱 FRONTEND

- [ ] Compilar build de producción localmente
  ```bash
  cd zoo-frontend
  npm run build -- --configuration production
  ```
  - No debe haber errores de compilación
  - No debe haber warnings críticos

- [ ] Verificar `environment.prod.ts`
  - `apiUrl` apunta al backend correcto
  - `recaptchaSiteKey` es el correcto de producción

- [ ] Validar SSR en local
  ```bash
  npm run serve:ssr
  # Debe servir sin errores en http://localhost:4200
  ```

## 🔌 BACKEND

- [ ] Compilar imagen Docker localmente
  ```bash
  cd zoo-backend
  docker build -t zoo-connect-backend:latest .
  ```

- [ ] Ejecutar migraciones de BD
  ```bash
  alembic upgrade head
  ```

- [ ] Probar endpoints críticos localmente
  ```bash
  # Auth
  curl -X POST http://localhost:8000/zooconnect/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@zconnect.com","password":"admin123"}'
  
  # Docs
  curl http://localhost:8000/zooconnect/docs
  ```

- [ ] Verificar variables de entorno
  ```bash
  # En el contenedor
  env | grep -E 'DATABASE_URL|REDIS_HOST|SECRET_KEY'
  ```

## 🚀 DEPLOY

- [ ] Commit todos los cambios
  ```bash
  git add -A
  git commit -m "🚀 Pre-producción: configuración y optimizaciones"
  git push origin Andres
  ```

- [ ] No hay cambios sin syncronizar con remote
  ```bash
  git status
  # Debe estar limpio (nothing to commit, working tree clean)
  ```

- [ ] Rama correcta antes de deployar
  ```bash
  git branch
  # Debe estar en * Andres
  ```

## 📊 MONITOREO

- [ ] Configurar logs en Railway/Render
  - Habilitar persistencia de logs
  - Establecer retención mínima (30 días)

- [ ] Configurar alertas
  - Errores 5xx
  - Conexión BD perdida
  - Redis desconectado

- [ ] Health check endpoint
  - ¿Existe? Si no, crear: `/zooconnect/health`
  - Debe responder en < 500ms

## ✨ FINAL

- [ ] Hacer una última revisión del código
  - No hay hardcoded credentials
  - No hay logs de password/token
  - No hay console.log o print en código crítico

- [ ] Documentación actualizada
  - README.md con instrucciones de deploy
  - Credenciales en lugar seguro (bitwarden, 1password, etc)

- [ ] Equipo notificado
  - Comunicar la fecha/hora de deploy
  - Tener plan de rollback si es necesario

---

## 📋 Checklist de deployment especíico:

### Si deployas en RAILWAY:
- [ ] Railway account con payment method
- [ ] GitHub conectado a Railway
- [ ] PostgreSQL service creado
- [ ] Redis service creado
- [ ] Variables de entorno agregadas
- [ ] Deploy trigger activado

### Si deployas en RENDER:
- [ ] Render account activa
- [ ] GitHub conectado a Render
- [ ] PostgreSQL service creado
- [ ] Redis service creado
- [ ] Environment variables agregadas
- [ ] Build and deploy triggers configurados

### Si deployas en VERCEL:
- [ ] Vercel account conectada a GitHub
- [ ] Root directory: `zoo-frontend/`
- [ ] Build command correcto
- [ ] Environment variable `BACKEND_URL`
- [ ] Redeploy trigger activado

---

**Una vez completada esta checklist, tu proyecto está listo para producción!** ✨

Para problemas comunes, ver: `DEPLOYMENT_GUIDE.md` sección "TROUBLESHOOTING"
