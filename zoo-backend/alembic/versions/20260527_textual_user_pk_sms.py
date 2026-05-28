"""textual user primary key and sms verification fields

Revision ID: 20260527_textual_user_pk_sms
Revises: 20260526_risk_matrix_permission
Create Date: 2026-05-27
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260527_textual_user_pk_sms"
down_revision: Union[str, Sequence[str], None] = "20260526_risk_matrix_permission"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


USER_FK_COLUMNS = [
    ("audit_logs", "user_id", True),
    ("animalfavorito", "usuario_id", False),
    ("encuestas", "usuario_creador_id", False),
    ("entradas_inventario", "usuario_id", False),
    ("historial_medico", "veterinario_id", False),
    ("onboarding_tour_progress", "user_id", False),
    ("PARTICIPACIONES_TRIVIA", "USUARIOS_Id_usuario", False),
    ("participaciones_encuesta", "usuario_id", False),
    ("password_history", "user_id", False),
    ("password_reset_tokens", "user_id", False),
    ("receta_medica", "usuario_asignado_id", True),
    ("refresh_tokens", "user_id", False),
    ("registro_alimentacion", "usuario_id", False),
    ("risk_matrix_entries", "created_by_id", True),
    ("risk_matrix_entries", "updated_by_id", True),
    ("salidas", "usuario_id", False),
    ("tarea", "usuario_asignado_id", True),
    ("tarea_recurrente", "usuario_asignado_id", True),
    ("TRIVIA", "USUARIOS_Id_usuario", False),
    ("two_factor_codes", "user_id", False),
    ("user_permissions", "user_id", False),
]


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users ADD COLUMN IF NOT EXISTS new_text_id varchar(120);
        UPDATE users
        SET new_text_id = CASE username
            WHEN 'admin_primary' THEN 'admin.admin.primary'
            WHEN 'admin_legacy' THEN 'jose.admin.alvarado'
            WHEN 'juan_cuida' THEN 'juan.cuidador.perez'
            WHEN 'ana_veterinaria' THEN 'ana.vet.garcia'
            WHEN 'visitante_pro' THEN 'ariel.visitante.gomez'
            WHEN 'soporte_tecnico' THEN 'soporte.admin.tecnico'
            WHEN 'osi' THEN 'oscar.osi.castro'
            ELSE trim(both '.' from regexp_replace(lower(username), '[^a-z0-9]+', '.', 'g'))
        END;
        UPDATE users
        SET new_text_id = 'user.visitante.' || id::text
        WHERE new_text_id IS NULL OR new_text_id = '';
        UPDATE users
        SET new_text_id = new_text_id || '.' || id::text
        WHERE new_text_id IN (
            SELECT new_text_id FROM users GROUP BY new_text_id HAVING count(*) > 1
        );
        """
    )

    op.execute(
        """
        DO $$
        DECLARE r record;
        BEGIN
          FOR r IN
            SELECT conrelid::regclass AS tbl, conname
            FROM pg_constraint
            WHERE confrelid = 'users'::regclass AND contype = 'f'
          LOOP
            EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
          END LOOP;
        END $$;
        """
    )

    for table_name, column_name, nullable in USER_FK_COLUMNS:
        temp_column = f"{column_name}_text"
        null_sql = "" if nullable else " NOT NULL"
        op.execute(
            f'''
            ALTER TABLE "{table_name}" ADD COLUMN "{temp_column}" varchar(120);
            UPDATE "{table_name}" AS target
            SET "{temp_column}" = users.new_text_id
            FROM users
            WHERE target."{column_name}" = users.id;
            ALTER TABLE "{table_name}" DROP COLUMN "{column_name}";
            ALTER TABLE "{table_name}" RENAME COLUMN "{temp_column}" TO "{column_name}";
            ALTER TABLE "{table_name}" ALTER COLUMN "{column_name}" SET DATA TYPE varchar(120);
            ALTER TABLE "{table_name}" ALTER COLUMN "{column_name}" {'DROP' if nullable else 'SET'} NOT NULL;
            '''
        )

    op.execute(
        """
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
        DROP INDEX IF EXISTS ix_users_id;
        ALTER TABLE users ALTER COLUMN id TYPE varchar(120) USING new_text_id;
        UPDATE users SET username = id;
        ALTER TABLE users ALTER COLUMN username TYPE varchar(120);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number varchar(25);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_otp_code varchar(10);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_otp_purpose varchar(32);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_otp_expires_at timestamp with time zone;
        UPDATE users SET email_verified = true WHERE is_active = true;
        UPDATE users SET phone_verified = true WHERE is_active = true;
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
        CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone_number ON users (phone_number);
        CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
        ALTER TABLE users DROP COLUMN new_text_id;
        """
    )

    for table_name, column_name, nullable in USER_FK_COLUMNS:
        op.execute(
            f'''
            ALTER TABLE "{table_name}"
            ADD CONSTRAINT "fk_{table_name}_{column_name}_users"
            FOREIGN KEY ("{column_name}") REFERENCES users(id);
            '''
        )


def downgrade() -> None:
    raise NotImplementedError(
        "Downgrade from textual user primary keys requires an explicit ID mapping backup."
    )
