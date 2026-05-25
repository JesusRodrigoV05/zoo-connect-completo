import io
import os

from pathlib import Path
from datetime import datetime, date
from typing import List, Optional
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
from sqlalchemy import func, text

try:
    from weasyprint import HTML as WeasyHTML

    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError):
    WeasyHTML = None
    WEASYPRINT_AVAILABLE = False

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    REPORTLAB_AVAILABLE = True
except ImportError:
    colors = None
    letter = None
    getSampleStyleSheet = None
    Paragraph = None
    SimpleDocTemplate = None
    Spacer = None
    Table = None
    TableStyle = None
    REPORTLAB_AVAILABLE = False

from app.models.tarea import Tarea
from app.models.user import User
from app.models import veterinario as models_vet
from app.models import inventario as models_inv
from app.crud import veterinario as crud_vet
from app.crud import transacciones as crud_trans

BASE_DIR = Path(__file__).resolve().parent.parent 
TEMPLATE_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "templates" / "assets"
CSS_DIR = BASE_DIR / "templates" / "css"

env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


def _safe_text(value) -> str:
    if value is None:
        return ""
    return str(value)


def _build_fallback_pdf(title: str, sections: list[tuple[str, str]], tables: list[tuple[str, list[list[str]]]] | None = None) -> bytes:
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("No hay un motor PDF disponible para generar el reporte")

    buffer = io.BytesIO()
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = [Paragraph(title, styles["Title"]), Spacer(1, 12)]

    for heading, body in sections:
        story.append(Paragraph(heading, styles["Heading2"]))
        story.append(Paragraph(_safe_text(body), styles["BodyText"]))
        story.append(Spacer(1, 12))

    for table_title, table_data in tables or []:
        story.append(Paragraph(table_title, styles["Heading2"]))
        story.append(Spacer(1, 6))
        story.append(Table(table_data, hAlign="LEFT"))
        story.append(Spacer(1, 12))

    doc.build(story)
    return buffer.getvalue()


def _build_diario_fallback_pdf(context: dict) -> bytes:
    tareas_data = context.get("tareas", [])
    table_data = [["Hora", "Descripción", "Zona", "Asignado a", "Estado"]]
    for tarea in tareas_data:
        table_data.append([
            _safe_text(tarea.get("hora")),
            _safe_text(tarea.get("descripcion")),
            _safe_text(tarea.get("zona")),
            _safe_text(tarea.get("asignado_a")),
            _safe_text(tarea.get("estado")),
        ])

    sections = [
        ("Usuario generador", _safe_text(context.get("usuario_generador"))),
        (
            "Resumen",
            "Tareas totales: " + _safe_text(context.get("tareas_total"))
            + " | Completadas: " + _safe_text(context.get("tareas_completadas"))
            + " | Pendientes: " + _safe_text(context.get("tareas_pendientes")),
        ),
        (
            "Alertas",
            "Tareas sin asignar o vencidas: " + _safe_text(len(context.get("alertas_tareas", []))),
        ),
    ]
    return _build_fallback_pdf("Diario Operativo", sections, [("Tareas", table_data)])


def _build_ficha_fallback_pdf(context: dict) -> bytes:
    historial = context.get("historial", {})
    animal = context.get("animal", {})
    recetas = context.get("recetas", [])

    table_data = [["Producto", "Dosis", "Unidad", "Frecuencia", "Duración"]]
    for receta in recetas:
        table_data.append([
            _safe_text(receta.get("producto")),
            _safe_text(receta.get("dosis")),
            _safe_text(receta.get("unidad")),
            _safe_text(receta.get("frecuencia")),
            _safe_text(receta.get("duracion")),
        ])

    sections = [
        ("Usuario generador", _safe_text(context.get("usuario_generador"))),
        (
            "Información de la atención",
            "Fecha: " + _safe_text(historial.get("fecha"))
            + " | Veterinario: " + _safe_text(historial.get("veterinario")),
        ),
        (
            "Animal",
            "Nombre: " + _safe_text(animal.get("nombre"))
            + " | Especie: " + _safe_text(animal.get("especie"))
            + " | Sexo: " + _safe_text(animal.get("sexo"))
            + " | Edad: " + _safe_text(animal.get("edad")),
        ),
        (
            "Diagnóstico",
            "Presuntivo: " + _safe_text(historial.get("diagnostico_presuntivo"))
            + " | Definitivo: " + _safe_text(historial.get("diagnostico_definitivo")),
        ),
    ]
    return _build_fallback_pdf("Ficha Clínica", sections, [("Recetas", table_data)])


def _build_kardex_fallback_pdf(context: dict) -> bytes:
    movimientos = context.get("movimientos", [])
    table_data = [["Fecha", "Tipo", "Producto", "Cantidad", "Usuario", "Detalle"]]
    for movimiento in movimientos:
        table_data.append([
            _safe_text(movimiento.get("fecha")),
            _safe_text(movimiento.get("tipo")),
            _safe_text(movimiento.get("producto")),
            _safe_text(movimiento.get("cantidad")),
            _safe_text(movimiento.get("usuario")),
            _safe_text(movimiento.get("detalle")),
        ])

    sections = [
        ("Usuario generador", _safe_text(context.get("usuario_generador"))),
        (
            "Rango de fechas",
            "Desde: " + _safe_text(context.get("fecha_inicio"))
            + " | Hasta: " + _safe_text(context.get("fecha_fin")),
        ),
    ]
    return _build_fallback_pdf("Kardex de Inventario", sections, [("Movimientos", table_data)])


class ReportService:

    @staticmethod
    def _render_pdf(template_name: str, context: dict) -> bytes:
        context["logo_path"] = f"file://{STATIC_DIR}/logo.png"
        context["css_path"] = f"file://{CSS_DIR}/styles.css"
        context["fecha_generacion"] = datetime.now().strftime("%d/%m/%Y %H:%M")
        context["empresa"] = "ZooConnect"

        if WEASYPRINT_AVAILABLE and WeasyHTML is not None:
            template = env.get_template(template_name)
            html_string = template.render(context)
            return WeasyHTML(string=html_string, base_url=str(BASE_DIR)).write_pdf()

        if template_name == "operativo/diario.html":
            return _build_diario_fallback_pdf(context)
        if template_name == "veterinaria/ficha_clinica.html":
            return _build_ficha_fallback_pdf(context)
        if template_name == "inventario/kardex.html":
            return _build_kardex_fallback_pdf(context)

        raise RuntimeError(f"No hay un motor PDF disponible para renderizar {template_name}")


    @classmethod
    def generate_diario_operativo(cls, db: Session, fecha: date, usuario_solicitante: User) -> bytes:
        
        tareas = db.query(Tarea).filter(Tarea.fecha_programada == fecha).all()

        total = len(tareas)
        completadas = sum(1 for t in tareas if t.is_completed)
        pendientes = total - completadas
        
        alertas = [t for t in tareas if not t.is_completed and not t.usuario_asignado_id]

        tareas_data = []
        for t in tareas:
            estado_str = "Completada" if t.is_completed else "Pendiente"
            asignado = t.usuario_asignado.email if t.usuario_asignado else "SIN ASIGNAR"
            ubicacion = f"{t.habitat.nombre_habitat}" if t.habitat else (t.animal.nombre_animal if t.animal else "General")

            tareas_data.append({
                "hora": "08:00",
                "descripcion": t.titulo,
                "zona": ubicacion,
                "asignado_a": asignado,
                "estado": estado_str
            })

        context = {
            "usuario_generador": usuario_solicitante.email,
            "tareas_total": total,
            "tareas_completadas": completadas,
            "tareas_pendientes": pendientes,
            "alertas_tareas": alertas,
            "tareas": tareas_data
        }

        return cls._render_pdf("operativo/diario.html", context)

    @classmethod
    def generate_ficha_clinica(cls, db: Session, historial_id: int, usuario_solicitante: User) -> bytes:
        
        historial = crud_vet.get_historial(db, historial_id)
        if not historial:
            raise ValueError("Historial no encontrado")

        animal = historial.animal
        
        recetas_data = []
        for r in historial.recetas:
            recetas_data.append({
                "producto": r.producto.nombre_producto,
                "dosis": r.dosis,
                "unidad": r.unidad_medida.abreviatura if r.unidad_medida else "u",
                "frecuencia": r.frecuencia,
                "duracion": r.duracion_dias
            })

        context = {
            "usuario_generador": usuario_solicitante.email,
            "historial": {
                "id": historial.id_historial,
                "fecha": historial.fecha_atencion.strftime("%d/%m/%Y"),
                "veterinario": historial.veterinario.email,
                "anamnesis": historial.anamnesis,
                "peso": historial.peso_actual,
                "temperatura": historial.temperatura,
                "fc": historial.frecuencia_cardiaca,
                "fr": historial.frecuencia_respiratoria,
                "observaciones_fisicas": historial.examen_fisico_obs,
                "diagnostico_presuntivo": historial.diagnostico_presuntivo,
                "diagnostico_definitivo": historial.diagnostico_definitivo
            },
            "animal": {
                "nombre": animal.nombre_animal,
                "especie": animal.especie.nombre_especie,
                "sexo": "Macho" if animal.genero else "Hembra",
                "edad": f"{animal.age} años" if animal.age else "Desc."
            },
            "recetas": recetas_data
        }

        return cls._render_pdf("veterinaria/ficha_clinica.html", context)


    @classmethod
    def generate_kardex(cls, db: Session, start_date: date, end_date: date, usuario_solicitante: User) -> bytes:
        
        entradas = db.query(models_inv.EntradaInventario).filter(
            func.date(models_inv.EntradaInventario.fecha_entrada) >= start_date,
            func.date(models_inv.EntradaInventario.fecha_entrada) <= end_date
        ).all()


        salidas = db.query(models_inv.Salida).filter(
            func.date(models_inv.Salida.fecha_salida) >= start_date,
            func.date(models_inv.Salida.fecha_salida) <= end_date
        ).all()

        movimientos = []

        for ent in entradas:
            for det in ent.detalles:
                movimientos.append({
                    "fecha_obj": ent.fecha_entrada,
                    "fecha": ent.fecha_entrada.strftime("%d/%m/%Y %H:%M"),
                    "tipo": "Entrada",
                    "producto": det.producto.nombre_producto,
                    "cantidad": f"+{det.cantidad_entrada}",
                    "usuario": ent.usuario.email,
                    "detalle": f"Prov: {ent.proveedor.nombre_proveedor} | Lote: {det.lote}"
                })

        for sal in salidas:
            for det in sal.detalles:
                destino = ""
                if det.animal: destino = f"Animal: {det.animal.nombre_animal}"
                elif det.habitat: destino = f"Hábitat: {det.habitat.nombre_habitat}"
                
                movimientos.append({
                    "fecha_obj": sal.fecha_salida,
                    "fecha": sal.fecha_salida.strftime("%d/%m/%Y %H:%M"),
                    "tipo": "Salida",
                    "producto": det.producto.nombre_producto,
                    "cantidad": f"-{det.cantidad_salida}",
                    "usuario": sal.usuario.email,
                    "detalle": f"Tipo: {sal.tipo_salida.nombre_tipo_salida} | {destino}"
                })

        movimientos.sort(key=lambda x: x["fecha_obj"], reverse=True)

        context = {
            "usuario_generador": usuario_solicitante.email,
            "fecha_inicio": start_date.strftime("%d/%m/%Y"),
            "fecha_fin": end_date.strftime("%d/%m/%Y"),
            "movimientos": movimientos
        }

        return cls._render_pdf("inventario/kardex.html", context)