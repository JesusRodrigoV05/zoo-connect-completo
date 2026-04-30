from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, timezone
from croniter import croniter
from app.db.session import SessionLocal
from app.models.tarea import TareaRecurrente, Tarea
from app.models.user import User
from app.models.audit_log import AuditLog

def generar_tareas_diarias():
    db: Session = SessionLocal()
    print(f"[{datetime.now()}] Iniciando job: 'generar_tareas_diarias'...")

    try:
        today = date.today()
        
        #obtener plantillas activas
        plantillas = db.query(TareaRecurrente).filter(
            TareaRecurrente.is_active == True
        ).all()

        tareas_creadas_count = 0
        errores_count = 0

        for plantilla in plantillas:
            try:
                midnight_today = datetime(today.year, today.month, today.day, 0, 0)
                base_time = midnight_today - timedelta(seconds=1) 
                
                cron = croniter(plantilla.frecuencia_cron, base_time)
                next_run = cron.get_next(datetime)

                if next_run.date() != today:
                    continue

                tarea_existente = db.query(Tarea).filter(
                    Tarea.tarea_recurrente_id == plantilla.id_tarea_recurrente,
                    Tarea.fecha_programada == today
                ).first()

                if tarea_existente:
                    continue

                print(f" + Creando tarea automatica: '{plantilla.titulo_plantilla}'...")

                nueva_tarea = Tarea(
                    titulo=plantilla.titulo_plantilla,
                    descripcion_tarea=plantilla.descripcion_plantilla,
                    tipo_tarea_id=plantilla.tipo_tarea_id,
                    animal_id=plantilla.animal_id,
                    habitat_id=plantilla.habitat_id,
                    tarea_recurrente_id=plantilla.id_tarea_recurrente,
                    fecha_programada=today,
                    usuario_asignado_id=plantilla.usuario_asignado_id, 
                    
                    is_completed=False
                )

                db.add(nueva_tarea)
                db.commit() 
                tareas_creadas_count += 1

            except Exception as e_inner:
                db.rollback()
                errores_count += 1
                print(f"Error procesando plantilla ID {plantilla.id_tarea_recurrente}: {e_inner}")
                continue

        print(f"Job completado. Creadas: {tareas_creadas_count}. Errores: {errores_count}")

    except Exception as e:
        print(f" ERROR El job 'generar_tareas_diarias' fallo a nivel general: {e}")
    
    finally:
        db.close()

def limpiar_usuarios_no_verificados():
    """
    Borra usuarios que no han verificado su email y cuyo código ha expirado.
    Se ejecuta periódicamente.
    """
    db: Session = SessionLocal()
    print(f"[{datetime.now()}] Iniciando job: 'limpiar_usuarios_no_verificados'...")

    try:
        now = datetime.now(timezone.utc)
        
        # Buscar usuarios no verificados con código expirado
        usuarios_a_borrar = db.query(User).filter(
            User.email_verified == False,
            User.verification_code_expires_at != None,
            User.verification_code_expires_at < now
        ).all()

        borrados_count = 0
        for user in usuarios_a_borrar:
            # Desvincular de logs de auditoria antes de borrar para evitar errores de integridad
            db.query(AuditLog).filter(AuditLog.user_id == user.id).update({AuditLog.user_id: None})
            
            db.delete(user)
            borrados_count += 1

        if borrados_count > 0:
            db.commit()
            print(f"Limpieza exitosa: {borrados_count} usuarios eliminados.")
        else:
            print("No hay usuarios expirados para limpiar.")

    except Exception as e:
        db.rollback()
        print(f" ERROR El job 'limpiar_usuarios_no_verificados' fallo: {e}")
    finally:
        db.close()
