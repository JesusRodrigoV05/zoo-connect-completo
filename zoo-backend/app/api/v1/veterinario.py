from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form, BackgroundTasks
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_animal_management_permission, require_admin_user, require_veterinario
from app.models.user import User
from app.models import veterinario as models_vet 

from app.crud import veterinario as crud_vet
from app.schemas import veterinario as schemas_vet
from app.crud import audit as crud_audit
from app.core.enums import AuditLogType

from app.core.uploader import upload_to_cloudinary, delete_from_cloudinary



router = APIRouter()

#TIPOATENCION

@router.post("/tipos-atencion", response_model=schemas_vet.TipoAtencionOut, status_code=201)
def create_tipo_atencion(
    obj_in: schemas_vet.TipoAtencionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_obj = crud_vet.create_tipo_atencion(db, obj_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_atencion_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de tipo de atención",
        detail=f"Nombre: {obj_in.nombre_tipo}",
        user_id=current_user.id
    )
    return new_obj

@router.get("/tipos-atencion", response_model=List[schemas_vet.TipoAtencionOut])
def list_tipos_atencion(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    return crud_vet.get_tipos_atencion_query(db, include_inactive).all()

@router.put("/tipos-atencion/{id}", response_model=schemas_vet.TipoAtencionOut)
def update_tipo_atencion(
    id: int,
    obj_in: schemas_vet.TipoAtencionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    updated_obj = crud_vet.update_tipo_atencion(db, id, obj_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_atencion_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de tipo de atención",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return updated_obj

@router.delete("/tipos-atencion/{id}", response_model=schemas_vet.TipoAtencionOut)
def delete_tipo_atencion(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    deleted_obj = crud_vet.delete_tipo_atencion(db, id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_atencion_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de tipo de atención",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return deleted_obj


#TIPO EXAMEN
@router.post("/tipos-examen", response_model=schemas_vet.TipoExamenOut, status_code=201)
def create_tipo_examen(
    obj_in: schemas_vet.TipoExamenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_obj = crud_vet.create_tipo_examen(db, obj_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_examen_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de tipo de examen",
        detail=f"Nombre: {obj_in.nombre_tipo}",
        user_id=current_user.id
    )
    return new_obj

@router.get("/tipos-examen", response_model=List[schemas_vet.TipoExamenOut])
def list_tipos_examen(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    return crud_vet.get_tipos_examen_query(db, include_inactive).all()

@router.put("/tipos-examen/{id}", response_model=schemas_vet.TipoExamenOut)
def update_tipo_examen(
    id: int,
    obj_in: schemas_vet.TipoExamenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    updated_obj = crud_vet.update_tipo_examen(db, id, obj_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_examen_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de tipo de examen",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return updated_obj

@router.delete("/tipos-examen/{id}", response_model=schemas_vet.TipoExamenOut)
def delete_tipo_examen(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    deleted_obj = crud_vet.delete_tipo_examen(db, id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="tipo_examen_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de tipo de examen",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return deleted_obj

#HISTORIAL MEDICO

@router.post("/historiales", response_model=schemas_vet.HistorialMedicoOut, status_code=201)
def create_historial(
    historial_in: schemas_vet.HistorialMedicoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_historial = crud_vet.create_historial(db, historial_in, veterinario_id=current_user.id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="historial_medico_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de historial médico",
        detail=f"Animal ID: {historial_in.animal_id}",
        user_id=current_user.id
    )
    return new_historial

@router.get("/historiales", response_model=Page[schemas_vet.HistorialMedicoOut])
def list_historiales(
    animal_id: Optional[int] = None,
    estado: Optional[bool] = None,
    solo_mis_registros: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    vet_id = current_user.id if solo_mis_registros else None
    query = crud_vet.get_historiales_query(db, animal_id, estado, vet_id)
    return paginate(query)

@router.get("/historiales/{id}", response_model=schemas_vet.HistorialMedicoOut)
def get_historial(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    historial = crud_vet.get_historial(db, id)
    if not historial:
        raise HTTPException(status_code=404, detail="Historial médico no encontrado")
    return historial

@router.put("/historiales/{id}", response_model=schemas_vet.HistorialMedicoOut)
def update_historial(
    id: int,
    historial_in: schemas_vet.HistorialMedicoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    db_historial = crud_vet.get_historial(db, id)
    if not db_historial:
        raise HTTPException(status_code=404, detail="Historial no encontrado")

    if not current_user.is_admin and db_historial.veterinario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el veterinario autor o un admin puede editar este historial")

    updated_historial = crud_vet.update_historial(db, db_historial, historial_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="historial_medico_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de historial médico",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return updated_historial


#RPDOCEDIMIENTOS

@router.post("/historiales/{id_historial}/procedimientos", response_model=schemas_vet.ProcedimientoOut, status_code=201)
def create_procedimiento(
    id_historial: int,
    proc_in: schemas_vet.ProcedimientoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_proc = crud_vet.create_procedimiento(db, proc_in, historial_id=id_historial)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="procedimiento_medico_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de procedimiento médico",
        detail=f"Historial ID: {id_historial}, Tipo: {proc_in.tipo_atencion_id}",
        user_id=current_user.id
    )
    return new_proc

@router.put("/procedimientos/{id}", response_model=schemas_vet.ProcedimientoOut)
def update_procedimiento(
    id: int,
    proc_in: schemas_vet.ProcedimientoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    updated_proc = crud_vet.update_procedimiento(db, id, proc_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="procedimiento_medico_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de procedimiento médico",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return updated_proc

@router.delete("/procedimientos/{id}")
def delete_procedimiento(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    deleted_proc = crud_vet.delete_procedimiento(db, id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="procedimiento_medico_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de procedimiento médico",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return deleted_proc

@router.get("/procedimientos", response_model=Page[schemas_vet.ProcedimientoOut])
def list_procedimientos(
    estado: Optional[str] = None,
    animal_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):

    query = db.query(models_vet.ProcedimientoMedico)
    
    if estado:
        query = query.filter(models_vet.ProcedimientoMedico.estado == estado)
    if animal_id:
        query = query.join(models_vet.ProcedimientoMedico.historial).filter(models_vet.HistorialMedico.animal_id == animal_id)
        
    query = query.order_by(models_vet.ProcedimientoMedico.fecha_programada.asc())
    return paginate(query)


#RECETAS
@router.get("/recetas", response_model=Page[schemas_vet.RecetaMedicaOut])
def list_recetas(
    animal_id: Optional[int] = None,
    usuario_asignado_id: Optional[int] = None,
    producto_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    query = db.query(models_vet.RecetaMedica)

    if animal_id:
        query = query.join(models_vet.RecetaMedica.historial).filter(models_vet.HistorialMedico.animal_id == animal_id)
    
    if usuario_asignado_id:
        query = query.filter(models_vet.RecetaMedica.usuario_asignado_id == usuario_asignado_id)
        
    if producto_id:
        query = query.filter(models_vet.RecetaMedica.producto_id == producto_id)

    query = query.order_by(models_vet.RecetaMedica.created_at.desc())
    return paginate(query)

@router.get("/recetas/{id}", response_model=schemas_vet.RecetaMedicaOut)
def get_receta(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    receta = db.query(models_vet.RecetaMedica).filter(models_vet.RecetaMedica.id_receta == id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return receta

@router.post("/historiales/{id_historial}/recetas", response_model=schemas_vet.RecetaMedicaOut, status_code=201)
def create_receta_medica(
    id_historial: int,
    receta_in: schemas_vet.RecetaMedicaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_receta = crud_vet.create_receta(db, receta_in, historial_id=id_historial)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="receta_medica_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de receta médica",
        detail=f"Historial ID: {id_historial}, Producto ID: {receta_in.producto_id}",
        user_id=current_user.id
    )
    return new_receta

@router.delete("/recetas/{id}")
def delete_receta_medica(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    deleted_receta = crud_vet.delete_receta(db, id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="receta_medica_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de receta médica",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return deleted_receta


#ORDENES
@router.get("/ordenes-examen", response_model=Page[schemas_vet.OrdenExamenOut])
def list_ordenes_examen(
    estado: Optional[str] = None,
    animal_id: Optional[int] = None,
    tipo_examen_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):

    query = db.query(models_vet.OrdenExamen)
    if estado:
        query = query.filter(models_vet.OrdenExamen.estado == estado)
        
    if tipo_examen_id:
        query = query.filter(models_vet.OrdenExamen.tipo_examen_id == tipo_examen_id)

    if animal_id:
        query = query.join(models_vet.OrdenExamen.historial).filter(models_vet.HistorialMedico.animal_id == animal_id)

    query = query.order_by(models_vet.OrdenExamen.estado.desc(), models_vet.OrdenExamen.created_at.desc())
    return paginate(query)


@router.get("/ordenes-examen/{id}", response_model=schemas_vet.OrdenExamenOut)
def get_orden_examen(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    orden = db.query(models_vet.OrdenExamen).filter(models_vet.OrdenExamen.id_orden == id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de examen no encontrada")
    return orden

@router.post("/historiales/{id_historial}/ordenes-examen", response_model=schemas_vet.OrdenExamenOut, status_code=201)
def create_orden_examen(
    id_historial: int,
    orden_in: schemas_vet.OrdenExamenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    new_orden = crud_vet.create_orden_examen(db, orden_in, historial_id=id_historial)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="orden_examen_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de orden de examen",
        detail=f"Historial ID: {id_historial}, Tipo: {orden_in.tipo_examen_id}",
        user_id=current_user.id
    )
    return new_orden

@router.delete("/ordenes-examen/{id}")
def delete_orden_examen(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    deleted_orden = crud_vet.delete_orden_examen(db, id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="orden_examen_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de orden de examen",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return deleted_orden

#RESULTADOS
@router.get("/resultados-examen", response_model=Page[schemas_vet.ResultadoExamenOut])
def list_resultados_examen(
    orden_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    query = db.query(models_vet.ResultadoExamen)

    if orden_id:
        query = query.filter(models_vet.ResultadoExamen.orden_examen_id == orden_id)

    query = query.order_by(models_vet.ResultadoExamen.fecha_resultado.desc())

    return paginate(query)

@router.get("/resultados-examen/{id}", response_model=schemas_vet.ResultadoExamenOut)
def get_resultado_examen(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_animal_management_permission)
):
    resultado = db.query(models_vet.ResultadoExamen).filter(models_vet.ResultadoExamen.id_resultado == id).first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    return resultado

@router.post("/ordenes-examen/{id_orden}/resultados", response_model=schemas_vet.ResultadoExamenOut, status_code=201)
def upload_resultado_examen(
    id_orden: int,
    conclusiones: Optional[str] = Form(None), 
    file: UploadFile = File(..., description="Archivo de evidencia"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):

    upload_result = None
    try:
        upload_result = upload_to_cloudinary(file, folder="veterinaria/examenes")
        
        file_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id")
        
        if not file_url or not public_id:
             raise HTTPException(status_code=500, detail="Error al obtener respuesta de Cloudinary")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo archivo: {str(e)}")

    try:
        resultado_in = schemas_vet.ResultadoExamenCreate(conclusiones=conclusiones)
        
        new_resultado = crud_vet.create_resultado_examen(
            db=db,
            orden_id=id_orden,
            resultado_in=resultado_in,
            file_url=file_url,
            public_id=public_id
        )
        
        background_tasks.add_task(
            crud_audit.create_audit_log,
            event="resultado_examen_uploaded",
            log_type=AuditLogType.APPLICATION,
            action="Subida de resultado de examen",
            detail=f"Orden ID: {id_orden}",
            user_id=current_user.id
        )
        return new_resultado

    except Exception as e:
        print(f" Error en BD: {public_id}")
        delete_from_cloudinary(public_id)
        raise e

@router.delete("/resultados-examen/{id}")
def delete_resultado_examen(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_veterinario),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    result = crud_vet.delete_resultado_examen(db, id)
    
    public_id = result.get("public_id")
    
    if public_id:
        try:
            delete_from_cloudinary(public_id)
        except Exception as e:
            print(f"Advertencia: No se pudo borrar imagen de Cloudinary {public_id}: {e}")
            
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="resultado_examen_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de resultado de examen",
        detail=f"ID: {id}",
        user_id=current_user.id
    )
    return {"detail": "Resultado y archivo eliminados correctamente"}