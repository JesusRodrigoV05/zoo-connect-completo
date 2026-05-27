#!/bin/bash
# 🚀 Script de Deploy para ZooConnect
# Este script facilitará el deploy del proyecto en diferentes plataformas

set -e

echo "================================"
echo "🚀 ZooConnect Deploy Script"
echo "================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "Andres" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Estás en la rama '$CURRENT_BRANCH' pero deberías estar en 'Andres' o 'main'${NC}"
    echo "Crea un commit y cambia de rama:"
    echo "  git checkout Andres"
    exit 1
fi

echo -e "${GREEN}✓ Rama correcta: $CURRENT_BRANCH${NC}"
echo ""

# Menu de opciones
echo "¿Dónde deseas deployar?"
echo "  1) Railway (Backend + BD + Redis)"
echo "  2) Render (Backend + BD + Redis)"
echo "  3) Vercel (Frontend)"
echo "  4) Todo (Railway Backend + Vercel Frontend)"
echo ""
read -p "Selecciona una opción (1-4): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo -e "${YELLOW}📦 Deploy en Railway${NC}"
        echo ""
        echo "Pasos a seguir:"
        echo "1. Ir a https://railway.app/new"
        echo "2. Conectar repositorio GitHub"
        echo "3. Seleccionar rama: $CURRENT_BRANCH"
        echo "4. Crear servicios:"
        echo "   - PostgreSQL 15"
        echo "   - Redis"
        echo "   - Web Service (Backend)"
        echo "5. Copiar variables de entorno desde: .env"
        echo ""
        echo "Más detalles en: DEPLOYMENT_GUIDE.md"
        ;;
    2)
        echo -e "${YELLOW}📦 Deploy en Render${NC}"
        echo ""
        echo "Pasos a seguir:"
        echo "1. Ir a https://dashboard.render.com/"
        echo "2. Conectar repositorio GitHub"
        echo "3. Crear servicios:"
        echo "   - PostgreSQL 15"
        echo "   - Redis"
        echo "   - Web Service (Backend)"
        echo "4. Build Command: pip install -r zoo-backend/requirements.txt"
        echo "5. Start Command: cd zoo-backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
        echo ""
        echo "Más detalles en: DEPLOYMENT_GUIDE.md"
        ;;
    3)
        echo -e "${YELLOW}📱 Deploy en Vercel${NC}"
        echo ""
        echo "Pasos a seguir:"
        echo "1. Ir a https://vercel.com/new"
        echo "2. Conectar repositorio GitHub"
        echo "3. Framework: Angular"
        echo "4. Root Directory: zoo-frontend/"
        echo "5. Output Directory: dist/zoo-connect-web/browser"
        echo "6. Build Command: npm run build -- --configuration production"
        echo "7. Environment Variable:"
        echo "   BACKEND_URL = [URL del backend en producción]"
        echo ""
        echo "Más detalles en: DEPLOYMENT_GUIDE.md"
        ;;
    4)
        echo -e "${YELLOW}🚀 Deploy Completo (Railway + Vercel)${NC}"
        echo ""
        echo "Este deploy desplegará:"
        echo "  ✓ Backend en Railway"
        echo "  ✓ PostgreSQL en Railway"
        echo "  ✓ Redis en Railway"
        echo "  ✓ Frontend en Vercel"
        echo ""
        echo "ANTES DE CONTINUAR, asegúrate de:"
        echo "  ✓ Tener cuenta en Railway.app"
        echo "  ✓ Tener cuenta en Vercel.com"
        echo "  ✓ Conectar ambas cuentas a tu GitHub"
        echo ""
        echo "Procedimiento:"
        echo "1. Railway - Backend:"
        echo "   - New Project → GitHub repo"
        echo "   - Rama: $CURRENT_BRANCH"
        echo "   - Agregar PostgreSQL 15 y Redis"
        echo "   - Variables de entorno: .env"
        echo ""
        echo "2. Vercel - Frontend:"
        echo "   - New Project → GitHub repo"
        echo "   - Root: zoo-frontend/"
        echo "   - Output: dist/zoo-connect-web/browser"
        echo ""
        read -p "¿Deseas continuar? (s/n): " CONFIRM
        if [ "$CONFIRM" != "s" ]; then
            echo "Deploy cancelado"
            exit 0
        fi
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}📖 Documentación Completa:${NC}"
echo -e "${GREEN}Abre el archivo: DEPLOYMENT_GUIDE.md${NC}"
echo -e "${GREEN}================================${NC}"
