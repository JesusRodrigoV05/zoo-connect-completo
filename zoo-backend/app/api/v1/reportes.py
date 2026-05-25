from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, Response
from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_animal_management_permission,
    require_inventory_read_permission,
    require_task_management_permission,
)
from app.core.report_service import ReportService
from app.core.security.events import SecurityEventType
from app.core.security.publisher import publish_security_event
from app.core.security.schemas import SecurityLogEvent
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


def _publish_export_event(
    *,
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: User,
    report_type: str,
):
    publish_security_event(
        SecurityLogEvent(
            event_type=SecurityEventType.MASS_EXPORT,
            severity="CRITICAL",
            user_id=current_user.id,
            module="reportes",
            action="download_report",
            status="success",
            metadata={"report_type": report_type},
        ),
        background_tasks=background_tasks,
        request=request,
    )


@router.get("/diario", response_class=Response)
def download_diario_operativo(
    fecha: date = Query(default_factory=date.today, description="Fecha del reporte"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_task_management_permission),
    background_tasks: BackgroundTasks = None,
    request: Request = None,
):
    try:
        pdf_bytes = ReportService.generate_diario_operativo(db, fecha, current_user)

        filename = f"Diario_Operativo_{fecha.strftime('%Y%m%d')}.pdf"

        if background_tasks is not None and request is not None:
            _publish_export_event(
                background_tasks=background_tasks,
                request=request,
                current_user=current_user,
                report_type="diario",
            )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Error al generar el PDF")


@router.get("/fichas-clinicas/{historial_id}", response_class=Response)
def download_ficha_clinica(
    historial_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission),
    background_tasks: BackgroundTasks = None,
    request: Request = None,
):
    try:
        pdf_bytes = ReportService.generate_ficha_clinica(db, historial_id, current_user)

        filename = f"Historia_Clinica_{historial_id}.pdf"

        if background_tasks is not None and request is not None:
            _publish_export_event(
                background_tasks=background_tasks,
                request=request,
                current_user=current_user,
                report_type="ficha_clinica",
            )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Historial medico no encontrado")
    except Exception:
        raise HTTPException(status_code=500, detail="Error al generar el PDF")


@router.get("/kardex", response_class=Response)
def download_kardex_inventario(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inventory_read_permission),
    background_tasks: BackgroundTasks = None,
    request: Request = None,
):
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="La fecha de inicio no puede ser mayor a la fecha fin",
        )

    try:
        pdf_bytes = ReportService.generate_kardex(db, start_date, end_date, current_user)

        filename = f"Kardex_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"

        if background_tasks is not None and request is not None:
            _publish_export_event(
                background_tasks=background_tasks,
                request=request,
                current_user=current_user,
                report_type="kardex",
            )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Error al generar el PDF")