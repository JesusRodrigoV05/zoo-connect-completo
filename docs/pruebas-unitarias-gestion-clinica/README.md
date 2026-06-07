# Pruebas unitarias — Gestión Clínica (Módulo 3)

Pruebas **unitarias** de los casos **CP31, CP32, CP33, CP35 y CP45**. Viven en este repositorio (`zoo-connect-completo`), junto al código de la aplicación.



## Qué incluye

| Capa | Herramienta | Ubicación | Qué valida |
|------|-------------|-----------|------------|
| Backend | pytest | `zoo-backend/tests/gestion_clinica/` | Reglas de negocio y CRUD (con mocks) |
| Frontend | Vitest | `zoo-frontend/src/tests/manueldelgadillo/` | Adaptadores y mapeo de datos |

No requieren navegador ni API en ejecución (aisladas con mocks).

---

## Estructura en el monorepo

```text
zoo-connect-completo/
├── docs/pruebas-unitarias-gestion-clinica/   ← este README
├── zoo-backend/
│   ├── pytest.ini
│   ├── requirements-dev.txt
│   └── tests/gestion_clinica/
│       ├── conftest.py
│       ├── test_cp31_crear_tipo_atencion.py
│       ├── test_cp32_registrar_consulta_clinica.py
│       ├── test_cp33_receta_genera_tarea_automatica.py
│       ├── test_cp35_emitir_orden_examen.py
│       └── test_cp45_cerrar_ciclo_clinico.py
└── zoo-frontend/
    ├── vitest.config.ts
    └── src/tests/manueldelgadillo/
        └── manuel-delgadillo.spec.ts
```

---

## Casos de prueba

| ID | Descripción | Backend | Frontend (Vitest) |
|----|-------------|---------|-------------------|
| CP31 | Crear tipo de atención | `test_cp31_crear_tipo_atencion.py` | `manuel-delgadillo.spec.ts` |
| CP32 | Registrar consulta clínica | `test_cp32_registrar_consulta_clinica.py` | `manuel-delgadillo.spec.ts` |
| CP33 | Receta genera tarea automática | `test_cp33_receta_genera_tarea_automatica.py` | `manuel-delgadillo.spec.ts` |
| CP35 | Emitir orden de examen | `test_cp35_emitir_orden_examen.py` | `manuel-delgadillo.spec.ts` |
| CP45 | Cerrar ciclo clínico | `test_cp45_cerrar_ciclo_clinico.py` | `manuel-delgadillo.spec.ts` |

---

## Backend (pytest)

### Instalación (una vez)

```powershell
cd zoo-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Ejecutar

```powershell
cd zoo-backend
$env:PYTHONPATH="."

# Todas
python -m pytest tests/gestion_clinica/ -v

# Una por una
python -m pytest tests/gestion_clinica/test_cp31_crear_tipo_atencion.py -v
python -m pytest tests/gestion_clinica/test_cp32_registrar_consulta_clinica.py -v
python -m pytest tests/gestion_clinica/test_cp33_receta_genera_tarea_automatica.py -v
python -m pytest tests/gestion_clinica/test_cp35_emitir_orden_examen.py -v
python -m pytest tests/gestion_clinica/test_cp45_cerrar_ciclo_clinico.py -v
```

---

## Frontend (Vitest)

### Instalación (una vez)

```powershell
cd zoo-frontend
npm install
```

### Ejecutar

```powershell
cd zoo-frontend

# Todas las unitarias del frontend
npm run test:unit

# Archivo unificado (5 casos: CP31, CP32, CP33, CP35, CP45)
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts

# Un caso por nombre (filtro)
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts -t "CP31"
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts -t "CP32"
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts -t "CP33"
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts -t "CP35"
npx vitest run src/tests/manueldelgadillo/manuel-delgadillo.spec.ts -t "CP45"
```

---

## Pruebas E2E (opcional, mismo repo)

Las pruebas de interfaz con **Playwright** (`zoo-frontend/e2e/gestion-clinica/`) no son unitarias ni ATDD; sirven para validar flujos completos en navegador durante el desarrollo. Requieren Docker (`docker compose up -d`) y credenciales en `.env.e2e`.

```powershell
cd zoo-frontend
npx playwright test e2e/gestion-clinica/cp31-tipo-atencion.spec.ts --headed
```

---

## Grupo / módulo

- **Módulo:** 3 — Gestión Clínica  
- **Casos:** CP31, CP32, CP33, CP35, CP45 (CP34 no incluido)
