# ⚡ QUICK REFERENCE - Deploy ZooConnect (Cheat Sheet)

## 📋 Archivos Disponibles

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| **INSTRUCCIONES_DEPLOY.md** | Paso a paso principal | 213 |
| **DEPLOYMENT_GUIDE.md** | Documentación completa | 214 |
| **PRE_DEPLOYMENT_CHECKLIST.md** | Validaciones pre-deploy | 181 |
| **POST_DEPLOYMENT_VALIDATION.md** | Tests post-deploy | 208 |
| **DEPLOY_SUMMARY.md** | Resumen ejecutivo | 158 |

## ⚙️ Configuraciones

| Archivo | Tipo | Líneas |
|---------|------|--------|
| **railway.json** | Config Railway | 38 |
| **render.yaml** | Config Render | 58 |
| **.env.production** | Variables | 51 |
| **vercel.json** | Config Vercel | 67 |
| **deploy.sh** | Script Linux/Mac | Auto |
| **deploy.bat** | Script Windows | Auto |

## 🌐 Frontend Environments

| Archivo | Uso |
|---------|-----|
| **environment.ts** | Desarrollo (localhost) |
| **environment.prod.ts** | Producción (Vercel) |
| **environment.staging.ts** | Staging |

---

## 🚀 DEPLOY EN 3 PASOS

### Paso 1: Railway Backend (5 min)
```
https://railway.app/new 
→ GitHub repo 
→ PostgreSQL 15 + Redis
→ Variables .env
```

### Paso 2: Vercel Frontend (5 min)
```
https://vercel.com/new
→ GitHub repo
→ Root: zoo-frontend/
→ Build: npm run build -- --configuration production
```

### Paso 3: Validar (5 min)
```
Login: admin@zconnect.com / admin123
Probar APIs: /zooconnect/docs
```

---

## 📊 Stack Producción

```
┌─────────────────────────────────────┐
│   VERCEL (Frontend Angular SSR)     │
│   https://zoo-connect-completo.app  │
└────────────────┬────────────────────┘
                 │ CORS OK
                 ↓
┌─────────────────────────────────────┐
│   RAILWAY (Backend FastAPI)         │
│   https://zoo-backend-xxx.railway   │
└──┬──────────────────────────────────┘
   │
   ├─→ PostgreSQL 15 (Railway)
   ├─→ Redis (Railway)
   └─→ RxJS / APScheduler Tasks
```

---

## 🔐 Seguridad

✅ CORS: Configurado para Vercel  
✅ HTTPS: Automático Railway + Vercel  
✅ Headers: X-Frame-Options, CSP, HSTS  
✅ JWT: Tokens con exp  
✅ DB: PostgreSQL 15  
✅ Cache: Redis  
✅ Email: Postmark SMTP  
✅ 2FA: TOTP  
✅ SMS: Textbee  
✅ Imágenes: Cloudinary  

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| CORS bloqueado | Agregar URL a CORS_ORIGINS en Railway |
| BD no conecta | Verificar DATABASE_URL en variables |
| Redis error | Check REDIS_HOST:PORT |
| Frontend 404 | Verificar BACKEND_URL en Vercel |
| Email no llega | Token Postmark correcto |

---

## 📞 Referencias

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Angular Docs**: https://angular.io/docs

---

## ✅ Checklist Final

- [ ] Leo INSTRUCCIONES_DEPLOY.md
- [ ] Railway creado + servicios
- [ ] Vercel creado + frontend
- [ ] Variables de entorno agregadas
- [ ] Deploy completado
- [ ] Login funciona
- [ ] APIs responden

---

**¡Listo para producción!** 🚀✨

*Creado: 27 de mayo, 2026*  
*Stack: FastAPI + Angular 21 + PostgreSQL + Redis*  
*Hosting: Railway + Vercel*  
*Status: ✅ 100% Ready*
