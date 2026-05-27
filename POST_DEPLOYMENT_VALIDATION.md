# 🧪 POST-DEPLOYMENT VALIDATION - ZooConnect

Una vez deployado, valida que todo funciona correctamente:

## 🔍 VALIDACIONES INMEDIATAS

### Backend Health

```bash
# 1. Verificar que el backend está online
curl https://<backend-url>/zooconnect/docs

# 2. Ver si hay errores en logs
railway logs  # Si usas Railway
# o en Render dashboard

# 3. Verificar migraciones BD
# Debe haber mensajes: "alembic upgrade head" completado

# 4. Verificar Redis connection
# Los logs NO deben mostrar: "redis.ConnectionError"
```

### Frontend Health

```bash
# 1. Acceder a la URL principal
https://zoo-connect-completo.vercel.app

# 2. Abrir DevTools (F12)
# Verificar en Console:
# - No debe haber errores rojo críticos
# - Alerts sobre CORS son OK al inicio

# 3. Revisar Network
# - Vercel serving: zoox.js, styles.css, etc
# - API calls: 200 OK responses
```

## 🧪 PRUEBAS FUNCIONALES

### 1. Autenticación

- [ ] **Login funciona**
  1. Ir a `/login`
  2. Ingresa: `admin@zconnect.com` / `admin123`
  3. Debe redirigir al dashboard
  4. Token debe estar en localStorage

- [ ] **Logout funciona**
  1. Click en logout/perfil
  2. Token debe borrase
  3. Debe redirigir a login

- [ ] **CORS no bloquea login**
  - En DevTools → Console
  - NO debe haber mensajes CORS rojo
  - Requests deben tener status 200

### 2. Base de Datos

- [ ] **Lectura funciona**
  1. Dashboard debe cargar datos
  2. Listados deben mostrar información
  3. Sin errores 500 en logs

- [ ] **Escritura funciona**
  1. Crear un nuevo elemento (si aplicable)
  2. Debe actualizar en tiempo real
  3. Datos persisten al refrescar

- [ ] **Migraciones OK**
  ```bash
  # Ver en logs:
  # "alembic upgrade head" - 0 nuevas migraciones pendientes
  ```

### 3. Email

- [ ] **Recuperación de contraseña**
  1. Click en "¿Olvidaste tu contraseña?"
  2. Ingresa email admin
  3. Debe recibir email en 30 segundos
  4. Link en email válido

- [ ] **Confirmación de email**
  - Si aplicable, test de cambio de email
  - Debe llegar email de confirmación

### 4. Seguridad 2FA (si está habilitada)

- [ ] **TOTP funciona**
  1. Setup 2FA en usuario
  2. Meter código del authenticator
  3. Debe validar correctamente

- [ ] **SMS OTP funciona** (si aplicable)
  1. Solicitar SMS
  2. Debe llegar en 60 segundos
  3. Sin errores de Textbee

### 5. Imágenes (Cloudinary)

- [ ] **Upload funciona**
  1. Upload de imagen en avatar/perfil
  2. Debe procesarse sin errores
  3. Imagen debe cargar en página

- [ ] **Cache funciona**
  1. Recargar página
  2. Imagen debe cargar desde cache (Fast)

### 6. APIs específicas

- [ ] **GET /zooconnect/animals** - Retorna 200
  ```bash
  curl -H "Authorization: Bearer <token>" \
       https://<backend>/zooconnect/animals
  ```

- [ ] **POST /zooconnect/auth/login** - Retorna token
  ```bash
  curl -X POST https://<backend>/zooconnect/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"pass"}'
  ```

## 🔒 VALIDACIONES DE SEGURIDAD

- [ ] **HTTPS activo**
  - URL debe ser `https://` no `http://`
  - Certificados válidos (no warnings)

- [ ] **Headers de seguridad**
  ```bash
  curl -I https://<backend>/zooconnect/docs
  # Debe incluir:
  # X-Frame-Options: DENY
  # X-Content-Type-Options: nosniff
  # Strict-Transport-Security: max-age=31536000
  ```

- [ ] **CORS solo permite orígenes correctos**
  ```bash
  # Hacer request desde origen no permitido
  # Debe bloquear (Access-Control-Allow-Origin: no)
  ```

- [ ] **Credenciales no en logs**
  - Ver logs del backend
  - NO debe haber PASSWORD, TOKEN, KEY en texto plano

- [ ] **Rate limiting funciona** (si está configurado)
  - Hacer muchas requests rápido
  - Debe retornar 429 Too Many Requests

## 📊 MONITOREO

- [ ] **Verificar logs en tiempo real**
  ```bash
  # Railway
  railway logs -f
  
  # Render
  # Dashboard → Service → Logs
  ```

- [ ] **Buenos indicadores**
  - Sin errores "ConnectionError"
  - Sin warnings critícos
  - Requests completándose < 500ms

- [ ] **Malos indicadores** (Revisar inmediatamente)
  - `KeyError` o `AttributeError`
  - `ConnectionError` con BD
  - `redis.ConnectionError`
  - `SSL: CERTIFICATE_VERIFY_FAILED`

## 🌍 PERFORMANCE

- [ ] **Frontend Load Time**
  - Primer load: < 5 segundos
  - Navegación: < 2 segundos
  - DevTools → Network tab

- [ ] **API Response Time**
  - Requests a `/docs`: < 500ms
  - Requests a `/animals`: < 1000ms
  - DevTools → Network tab

- [ ] **Database Performance**
  - Queries sin N+1 problem
  - Sin timeouts
  - Response rápida

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### Error: CORS bloqueado
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solución:**
1. Ir a Railway/Render dashboard
2. Environment variables
3. Agregar URL del frontend a `CORS_ORIGINS`
4. Restart del servicio

### Error: Cannot connect to database
```
psycopg2.OperationalError: could not connect to server
```
**Solución:**
1. Verificar `DATABASE_URL` está correcto
2. Revisar que PostgreSQL service está running
3. Check logs para connection string
4. Restart services

### Error: Redis connection refused
```
redis.ConnectionError: Error -3 connecting to redis
```
**Solución:**
1. Verificar Redis service está correcto
2. Check `REDIS_HOST` y `REDIS_PORT`
3. Test manual: `redis-cli ping`
4. Restart Redis service

### Error: Frontend no encuentra backend
```
POST 404 /zooconnect/auth/login
```
**Solución:**
1. Verificar `BACKEND_URL` en Vercel env vars
2. Verificar `/zoConnect/auth/login` existe en backend
3. Verificar backend está online
4. Test: `curl https://<backend>/zooconnect/docs`

## ✅ SIGN-OFF

Una vez validadas todas las pruebas, marcar como completadas:

- [ ] Backend funciona correctamente
- [ ] Frontend funciona correctamente
- [ ] Autenticación funciona
- [ ] Base de datos funciona
- [ ] Email funciona
- [ ] CORS configurado correctamente
- [ ] HTTPS activado
- [ ] Headers de seguridad presentes
- [ ] Performance aceptable
- [ ] Monitoreo activo

**READY FOR PRODUCTION!** 🚀✨

---

## 📞 Escalation

Si encuentras problemas:

1. Ver logs completos
2. Revisar sección TROUBLESHOOTING en `DEPLOYMENT_GUIDE.md`
3. Contactar a: andres.urquidi@ucb.edu.bo

Mantener dashboard abierto por 24-48 horas post-deployment:
- Railway: https://railway.app/dashboard
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
