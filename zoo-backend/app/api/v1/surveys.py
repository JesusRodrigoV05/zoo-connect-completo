from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_active_user, require_admin_user
from app.crud import survey as crud_survey
from app.crud import audit as crud_audit
from app.core.enums import AuditLogType

from app.schemas.survey import (
    EncuestaCreate, EncuestaUpdate, EncuestaOut,
    PreguntaEncuestaCreate, PreguntaEncuestaUpdate, PreguntaEncuestaOut,
    OpcionEncuestaCreate, OpcionEncuestaUpdate, OpcionEncuestaOut,
    ParticipacionCreate, ParticipacionUpdate, ParticipacionOut,
    RespuestaCreate, RespuestaUpdate, RespuestaOut
)

router = APIRouter()


@router.post("/surveys/", response_model=EncuestaOut, tags=["Encuestas"], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_user)])
def create_encuesta(
    encuesta_in: EncuestaCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    encuesta = crud_survey.create_encuesta(db, encuesta_in, usuario_id=current_user.id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_created",
        log_type=AuditLogType.APPLICATION,
        action="Creación de encuesta",
        detail=f"Título: {encuesta.titulo}",
        user_id=current_user.id
    )
    return encuesta

@router.get("/surveys/", response_model=List[EncuestaOut], tags=["Encuestas"])
def list_encuestas(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_survey.list_encuestas(db, skip=skip, limit=limit)

@router.get("/surveys/{encuesta_id}", response_model=EncuestaOut, tags=["Encuestas"])
def get_encuesta(encuesta_id: int, db: Session = Depends(get_db)):
    encuesta = crud_survey.get_encuesta(db, encuesta_id)
    if not encuesta:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")
    return encuesta

@router.put("/surveys/{encuesta_id}", response_model=EncuestaOut, tags=["Encuestas"], dependencies=[Depends(require_admin_user)])
def update_encuesta(
    encuesta_id: int, 
    encuesta_in: EncuestaUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    encuesta = crud_survey.update_encuesta(db, encuesta_id, encuesta_in)
    if not encuesta:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de encuesta",
        detail=f"ID: {encuesta_id}",
        user_id=current_user.id
    )
    return encuesta

@router.delete("/surveys/{encuesta_id}", tags=["Encuestas"], status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_user)])
def delete_encuesta(
    encuesta_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    if not crud_survey.delete_encuesta(db, encuesta_id):
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de encuesta",
        detail=f"ID: {encuesta_id}",
        user_id=current_user.id
    )
    return None


@router.post("/surveys/{encuesta_id}/preguntas", response_model=PreguntaEncuestaOut, tags=["Preguntas"], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_user)])
def add_pregunta_a_encuesta(
    encuesta_id: int, 
    pregunta_in: PreguntaEncuestaCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    pregunta = crud_survey.add_pregunta_a_encuesta(db, encuesta_id, pregunta_in)
    if not pregunta:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada para añadir la pregunta")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_question_created",
        log_type=AuditLogType.APPLICATION,
        action="Adición de pregunta a encuesta",
        detail=f"Encuesta ID: {encuesta_id}, Pregunta: {pregunta_in.texto_pregunta}",
        user_id=current_user.id
    )
    return pregunta

@router.get("/surveys/preguntas/{pregunta_id}", response_model=PreguntaEncuestaOut, tags=["Preguntas"])
def get_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    pregunta = crud_survey.get_pregunta(db, pregunta_id)
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return pregunta

@router.put("/surveys/preguntas/{pregunta_id}", response_model=PreguntaEncuestaOut, tags=["Preguntas"], dependencies=[Depends(require_admin_user)])
def update_pregunta(
    pregunta_id: int, 
    pregunta_in: PreguntaEncuestaUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    pregunta = crud_survey.update_pregunta(db, pregunta_id, pregunta_in)
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_question_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de pregunta de encuesta",
        detail=f"Pregunta ID: {pregunta_id}",
        user_id=current_user.id
    )
    return pregunta

@router.delete("/surveys/preguntas/{pregunta_id}", tags=["Preguntas"], status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_user)])
def delete_pregunta(
    pregunta_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    if not crud_survey.delete_pregunta(db, pregunta_id):
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_question_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de pregunta de encuesta",
        detail=f"Pregunta ID: {pregunta_id}",
        user_id=current_user.id
    )
    return None


@router.post("/surveys/preguntas/{pregunta_id}/opciones", response_model=OpcionEncuestaOut, tags=["Opciones"], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_user)])
def add_opcion_a_pregunta(
    pregunta_id: int, 
    opcion_in: OpcionEncuestaCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        opcion = crud_survey.add_opcion_a_pregunta(db, pregunta_id, opcion_in)
        background_tasks.add_task(
            crud_audit.create_audit_log,
            event="survey_option_created",
            log_type=AuditLogType.APPLICATION,
            action="Adición de opción a pregunta",
            detail=f"Pregunta ID: {pregunta_id}, Opción: {opcion_in.texto_opcion}",
            user_id=current_user.id
        )
        return opcion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/surveys/opciones/{opcion_id}", response_model=OpcionEncuestaOut, tags=["Opciones"], dependencies=[Depends(require_admin_user)])
def update_opcion(
    opcion_id: int, 
    opcion_in: OpcionEncuestaUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    opcion = crud_survey.update_opcion(db, opcion_id, opcion_in)
    if not opcion:
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_option_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de opción de encuesta",
        detail=f"Opción ID: {opcion_id}",
        user_id=current_user.id
    )
    return opcion

@router.delete("/surveys/opciones/{opcion_id}", tags=["Opciones"], status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_user)])
def delete_opcion(
    opcion_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    if not crud_survey.delete_opcion(db, opcion_id):
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_option_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de opción de encuesta",
        detail=f"Opción ID: {opcion_id}",
        user_id=current_user.id
    )
    return None


@router.post("/participations/", response_model=ParticipacionOut, tags=["Participaciones"], status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_active_user)])
def create_participacion(
    participacion_in: ParticipacionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        participacion = crud_survey.create_participacion(db, participacion_in, usuario_id=current_user.id)
        background_tasks.add_task(
            crud_audit.create_audit_log,
            event="survey_participation_created",
            log_type=AuditLogType.APPLICATION,
            action="Creación de participación en encuesta",
            detail=f"Encuesta ID: {participacion_in.encuesta_id}",
            user_id=current_user.id
        )
        return participacion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/participations/{participacion_id}", response_model=ParticipacionOut, tags=["Participaciones"], dependencies=[Depends(get_current_active_user)])
def get_participacion(participacion_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    participacion = crud_survey.get_participacion(db, participacion_id)
    if not participacion or participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Participacion no encontrada o no pertenece al usuario")
    return participacion

@router.put("/participations/{participacion_id}", response_model=ParticipacionOut, tags=["Participaciones"], dependencies=[Depends(get_current_active_user)])
def update_participacion(
    participacion_id: int, 
    participacion_in: ParticipacionUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    participacion = crud_survey.get_participacion(db, participacion_id)
    if not participacion or participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Participacion no encontrada o no pertenece al usuario")
    updated_participacion = crud_survey.update_participacion(db, participacion_id, participacion_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_participation_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de participación en encuesta",
        detail=f"Participación ID: {participacion_id}",
        user_id=current_user.id
    )
    return updated_participacion

@router.delete("/participations/{participacion_id}", tags=["Participaciones"], status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_active_user)])
def delete_participacion(
    participacion_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    participacion = crud_survey.get_participacion(db, participacion_id)
    if not participacion or participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Participacion no encontrada o no pertenece al usuario")
    crud_survey.delete_participacion(db, participacion_id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_participation_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de participación en encuesta",
        detail=f"Participación ID: {participacion_id}",
        user_id=current_user.id
    )
    return None

#pruebas
@router.get("/participations/", response_model=List[ParticipacionOut], tags=["Participaciones"])
def list_user_participaciones(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return crud_survey.list_user_participaciones(db, usuario_id=current_user.id)


@router.get("/surveys/{encuesta_id}/stats", tags=["Encuestas"])
def get_survey_stats(encuesta_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return crud_survey.get_survey_stats(db, encuesta_id)


#@router.get("/participacionslist/", response_model=List[ParticipacionOut], tags=["Participaciones"])
#def list_encuestas(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
#    return crud_survey.list_encuestas(db, skip=skip, limit=limit)

#
@router.post("/responses/", response_model=RespuestaOut, tags=["Respuestas"], status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_active_user)])
def create_respuesta(
    respuesta_in: RespuestaCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        respuesta = crud_survey.create_respuesta(db, respuesta_in, usuario_id=current_user.id)
        background_tasks.add_task(
            crud_audit.create_audit_log,
            event="survey_response_created",
            log_type=AuditLogType.APPLICATION,
            action="Creación de respuesta a encuesta",
            detail=f"Participación ID: {respuesta_in.participacion_id}",
            user_id=current_user.id
        )
        return respuesta
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/responses/{respuesta_id}", response_model=RespuestaOut, tags=["Respuestas"], dependencies=[Depends(get_current_active_user)])
def get_respuesta(respuesta_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    respuesta = crud_survey.get_respuesta(db, respuesta_id)
    if not respuesta or respuesta.participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada o no pertenece al usuario")
    return respuesta

@router.put("/responses/{respuesta_id}", response_model=RespuestaOut, tags=["Respuestas"], dependencies=[Depends(get_current_active_user)])
def update_respuesta(
    respuesta_id: int, 
    respuesta_in: RespuestaUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    respuesta = crud_survey.get_respuesta(db, respuesta_id)
    if not respuesta or respuesta.participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada o no pertenece al usuario")
    updated_respuesta = crud_survey.update_respuesta(db, respuesta_id, respuesta_in)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_response_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualización de respuesta a encuesta",
        detail=f"Respuesta ID: {respuesta_id}",
        user_id=current_user.id
    )
    return updated_respuesta

@router.delete("/responses/{respuesta_id}", tags=["Respuestas"], status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_active_user)])
def delete_respuesta(
    respuesta_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    respuesta = crud_survey.get_respuesta(db, respuesta_id)
    if not respuesta or respuesta.participacion.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada o no pertenece al usuario")
    crud_survey.delete_respuesta(db, respuesta_id)
    background_tasks.add_task(
        crud_audit.create_audit_log,
        event="survey_response_deleted",
        log_type=AuditLogType.APPLICATION,
        action="Eliminación de respuesta a encuesta",
        detail=f"Respuesta ID: {respuesta_id}",
        user_id=current_user.id
    )
    return None