# 🚀 Guía Completa de Deploy - ZooConnect a Producción

## 📋 Requisitos Previos

- Cuenta en **Vercel** (frontend)
- Cuenta en **Railway** o **Render** (backend)
- Git configurado localmente
- Node.js 18+ instalado
- Python 3.10+ instalado

---

## 🌐 OPCIÓN 1: DEPLOY EN RAILWAY (Recomendado)

### Paso 1: Preparar el Backend

```bash
# Actualizar el .env con variables de railway
cd zoo-backend

# Las variables se configurarán en dashboard de Railway:
# - DATABASE_URL: Auto-generada por Railway Postgres
# - REDIS_HOST: Auto-generada por Railway Redis
# - SECRET_KEY: Generar una nueva (32 caracteres)
# - POSTMARK_SERVER_TOKEN: Token específico
# - RECAPTCHA_SECRET_KEY: Del panel de Google
```

### Paso 2: Crear Proyecto en Railway

1. Ir a https://railway.app
2. Crear nuevo proyecto
3. Conectar repositorio GitHub
4. Seleccionar la rama `Andres` (o main)

### Paso 3: Configurar Variables de Entorno en Railway

En el dashboard de Railway, ir a Variables y agregar:

```env
SECRET_KEY=generar_aleatoriamente
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=100
REFRESH_TOKEN_EXPIRE_DAYS=5
MEDIA_DIR=./media
CORS_ORIGINS=["https://zoo-connect-completo.vercel.app"]
FRONTEND_RESET_PASSWORD_URL=https://zoo-connect-completo.vercel.app/reset-password
TOTP_ENCRYPTION_KEY=<copiar_del_.env>
MAIL_FROM=andres.urquidi@ucb.edu.bo
MAIL_FROM_NAME=Soporte ZooConnect
MAIL_PORT=587
MAIL_SERVER=smtp.postmarkapp.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
DEFAULT_ADMIN_EMAIL=admin@zconnect.com
DEFAULT_ADMIN_PASSWORD=<nueva_contraseña_segura>
DEFAULT_ADMIN_PHONE=+10000000001
TEXTBEE_API_BASE_URL=https://api.textbee.dev/api/v1
TEXTBEE_API_KEY=<copiar_del_.env>
TEXTBEE_DEVICE_ID=<copiar_del_.env>
SMS_OTP_EXPIRE_MINUTES=10
CLOUDINARY_CLOUD_NAME=<copiar_del_.env>
CLOUDINARY_API_KEY=<copiar_del_.env>
CLOUDINARY_API_SECRET=<copiar_del_.env>
POSTMARK_SERVER_TOKEN=<copiar_del_.env>
RECAPTCHA_SITE_KEY=6Ld6h_4sAAAAALfm8CYVAY_QkGJ-e44FB-PXGs-3
RECAPTCHA_SECRET_KEY=<copiar_del_.env>
```

### Paso 4: Crear Servicios en Railway

**PostgreSQL:**
- Click en "+ Create"
- Select "Database"
- PostgreSQL
- Versions 15

**Redis:**
- Click en "+ Create"  
- Select "Database"
- Redis

### Paso 5: Deploy

```bash
# Railway automaticamente detecta cambios en el repositorio
# El deploy se ejecutará automáticamente en cada push

# Para ver logs:
railway logs
```

---

## 🌐 OPCIÓN 2: DEPLOY EN RENDER.COM

### Paso 1: Preparar el Proyecto

```bash
# Asegurar que el Dockerfile esté actualizado
ls -la zoo-backend/Dockerfile
```

### Paso 2: Crear Servicios en Render

1. **Base de datos PostgreSQL:**
   - https://dashboard.render.com
   - New → PostgreSQL
   - Name: `zoo-postgres-prod`
   - PostgreSQL Version: 15
   - Region: Similar al backend

2. **Redis:**
   - New → Redis
   - Name: `zoo-redis-prod`
   - Region: Similar al backend

3. **Backend (Web Service):**
   - New → Web Service
   - Connect GitHub repo
   - Build Command: `pip install -r zoo-backend/requirements.txt`
   - Start Command: `cd zoo-backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables: (ver sección Railway arriba)

### Paso 3: Validar Deploy Render

```bash
# Verificar URL del servicio
# Debe ser: https://zoo-connect-backend.onrender.com
```

---

## 📱 FRONTEND - DEPLOY EN VERCEL

### Paso 1: Conectar Repositorio

```bash
# Ir a https://vercel.com/new
# Conectar GitHub
# Seleccionar repositorio: zoo-connect-completo
```

### Paso 2: Configurar Proyecto Vercel

1. **Framework Preset:** Angular
2. **Output Directory:** `dist/zoo-connect-web/browser`
3. **Build Command:** `npm run build`
4. **Install Command:** `npm install`
5. **Root Directory:** `zoo-frontend/`

### Paso 3: Variables de Entorno en Vercel

En Project Settings → Environment Variables:

```env
BACKEND_URL=https://zoo-connect-backend.onrender.com/zooconnect
# O si usa Railway:
BACKEND_URL=https://zoo-connect-backend-<random>.railway.app/zooconnect
```

### Paso 4: Deploy

```bash
# Vercel automaticamente detecta cambios en main/master
# El deploy se ejecutará automáticamente en cada push

# O hacer push manual desde consola:
git push
```

---

## 🔧 CONFIGURACIÓN CORS - IMPORTANTE

En `zoo-backend/app/core/config.py`, el CORS ya incluye:

```python
CORS_ORIGINS: List[str] = [
    "http://localhost:4200",  # Desarrollo
    "https://vercel-zoo-connect.vercel.app",
    "https://vercel-zoo-connect-git-main-mfjm0265-7988s-projects.vercel.app",
    "https://zoo-connect-completo.vercel.app",
]
```

✅ **Esto ya está correcto** - no requiere cambios

---

## 🧪 POST-DEPLOY CHECKLIST

### Backend

- [ ] Acceder a `https://<backend-url>/docs` - debe cargar Swagger UI
- [ ] Verificar que `/zooconnect/docs` funciona
- [ ] Probar endpoint de salud: `/zooconnect/health` (si existe)
- [ ] Revisar logs para errores de BD
- [ ] Verificar que migraciones se ejecutaron: `alembic upgrade head`

### Frontend  

- [ ] Frontend carga sin errores CORS
- [ ] Login funciona correctamente
- [ ] Las APIs responden correctamente
- [ ] SSR funciona en Vercel

### Full Stack

- [ ] Crear usuario de prueba
- [ ] Probar autenticación 2FA
- [ ] Enviar email de prueba
- [ ] Verificar SMS OTP (si aplica)
- [ ] Cargar imagen (Cloudinary)

---

## 🔐 SOBRE SECRETOS Y CREDENCIALES

⚠️ **NUNCA** commitear credenciales en el repositorio

En Railway/Render utilizar **Environment Variables** para:
- `SECRET_KEY`: Generar nueva
- `POSTMARK_SERVER_TOKEN`: Token de producción
- `RECAPTCHA_SECRET_KEY`: Producción
- `CLOUDINARY_*`: Credenciales de producción

---

## 🆘 TROUBLESHOOTING

### Error: CORS bloqueado
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solución:** Agregar el URL del frontend a `CORS_ORIGINS` en Railway/Render

### Error: PostgreSQL connection refused
```
psycopg2.OperationalError: could not connect to server
```
**Solución:** 
1. Verificar `DATABASE_URL` en variables de entorno
2. Check PostgreSQL service status en Railway/Render
3. Revisar que la URL tenga formato correcto: `postgresql+psycopg2://user:pass@host:port/db`

### Error: Redis connection refused
```
redis.ConnectionError: Error -3 connecting to...
```
**Solución:**
1. Verificar `REDIS_HOST` y `REDIS_PORT`
2. Comprobar que el servicio Redis está corriendo

### Frontend no encuentra backend
```
403 Forbidden / 404 Not Found
```
**Solución:**
1. Verificar `BACKEND_URL` en variables de Vercel
2. Comprobar que el backend está deployado correctamente
3. Validar CORS en backend

---

## 📞 CONTACTO & SOPORTE

- **Email:** andres.urquidi@ucb.edu.bo
- **Dashboard Railway:** https://railway.app/dashboard
- **Dashboard Render:** https://dashboard.render.com
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Documentación API:** https://<backend-url>/docs

---

## 📝 NOTAS IMPORTANTES

1. El backend requiere que las migraciones se ejecuten: `alembic upgrade head`
2. El CORS está correctamente configurado - no hay conflictos
3. Usa Postmark para email (SMTP, compatible con cualquier hosting)
4. Las credenciales de Cloudinary, RECAPTCHA, etc. deben estar en variables de entorno
5. El timeout de sesión es de 100 minutos para tokens de acceso

**¡Listo para producción!** 🎉
