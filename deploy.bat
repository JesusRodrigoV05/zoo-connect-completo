@echo off
REM 🚀 Script de Deploy para ZooConnect (Windows)
REM Este script facilitará el deploy del proyecto en diferentes plataformas

setlocal enabledelayedexpansion

echo.
echo ================================
echo 🚀 ZooConnect Deploy Script
echo ================================
echo.

REM Verificar que estamos en la rama correcta
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

if not "%CURRENT_BRANCH%"=="Andres" if not "%CURRENT_BRANCH%"=="main" (
    echo ❌ Error: Estas en la rama '%CURRENT_BRANCH%' pero deberias estar en 'Andres' o 'main'
    echo Cambia de rama:
    echo   git checkout Andres
    exit /b 1
)

echo ✓ Rama correcta: %CURRENT_BRANCH%
echo.

REM Menu de opciones
echo ¿Donde deseas deployar?
echo   1) Railway (Backend + BD + Redis)
echo   2) Render (Backend + BD + Redis)
echo   3) Vercel (Frontend)
echo   4) Todo (Railway Backend + Vercel Frontend)
echo.

set /p DEPLOY_OPTION="Selecciona una opcion (1-4): "

if "%DEPLOY_OPTION%"=="1" (
    echo.
    echo 📦 Deploy en Railway
    echo.
    echo Pasos a seguir:
    echo 1. Ir a https://railway.app/new
    echo 2. Conectar repositorio GitHub
    echo 3. Seleccionar rama: %CURRENT_BRANCH%
    echo 4. Crear servicios:
    echo    - PostgreSQL 15
    echo    - Redis
    echo    - Web Service (Backend)
    echo 5. Copiar variables de entorno desde: .env
    echo.
    echo Mas detalles en: DEPLOYMENT_GUIDE.md
) else if "%DEPLOY_OPTION%"=="2" (
    echo.
    echo 📦 Deploy en Render
    echo.
    echo Pasos a seguir:
    echo 1. Ir a https://dashboard.render.com/
    echo 2. Conectar repositorio GitHub
    echo 3. Crear servicios:
    echo    - PostgreSQL 15
    echo    - Redis
    echo    - Web Service (Backend)
    echo 4. Build Command: pip install -r zoo-backend/requirements.txt
    echo 5. Start Command: cd zoo-backend ^&^& alembic upgrade head ^&^& uvicorn app.main:app --host 0.0.0.0 --port %%PORT%%
    echo.
    echo Mas detalles en: DEPLOYMENT_GUIDE.md
) else if "%DEPLOY_OPTION%"=="3" (
    echo.
    echo 📱 Deploy en Vercel
    echo.
    echo Pasos a seguir:
    echo 1. Ir a https://vercel.com/new
    echo 2. Conectar repositorio GitHub
    echo 3. Framework: Angular
    echo 4. Root Directory: zoo-frontend/
    echo 5. Output Directory: dist/zoo-connect-web/browser
    echo 6. Build Command: npm run build -- --configuration production
    echo 7. Environment Variable:
    echo    BACKEND_URL = [URL del backend en produccion]
    echo.
    echo Mas detalles en: DEPLOYMENT_GUIDE.md
) else if "%DEPLOY_OPTION%"=="4" (
    echo.
    echo 🚀 Deploy Completo (Railway + Vercel)
    echo.
    echo Este deploy desplegara:
    echo   ✓ Backend en Railway
    echo   ✓ PostgreSQL en Railway
    echo   ✓ Redis en Railway
    echo   ✓ Frontend en Vercel
    echo.
    echo ANTES DE CONTINUAR, asegurate de:
    echo   ✓ Tener cuenta en Railway.app
    echo   ✓ Tener cuenta en Vercel.com
    echo   ✓ Conectar ambas cuentas a tu GitHub
    echo.
    echo Procedimiento:
    echo 1. Railway - Backend:
    echo    - New Project ^> GitHub repo
    echo    - Rama: %CURRENT_BRANCH%
    echo    - Agregar PostgreSQL 15 y Redis
    echo    - Variables de entorno: .env
    echo.
    echo 2. Vercel - Frontend:
    echo    - New Project ^> GitHub repo
    echo    - Root: zoo-frontend/
    echo    - Output: dist/zoo-connect-web/browser
    echo.
) else (
    echo ❌ Opcion invalida
    exit /b 1
)

echo.
echo ================================
echo 📖 Documentacion Completa:
echo Abre el archivo: DEPLOYMENT_GUIDE.md
echo ================================
echo.

endlocal
