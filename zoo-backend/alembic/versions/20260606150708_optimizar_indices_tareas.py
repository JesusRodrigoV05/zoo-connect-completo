"""optimizar indices tareas para rendimiento

Revision ID: 20260606150708
Revises: 3bf03dc85234
Create Date: 2026-06-06 15:07:08.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '20260606150708'
down_revision: Union[str, Sequence[str], None] = '3bf03dc85234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Composite indexes for task listing queries
    op.create_index(
        'idx_tarea_asignado_fecha_completado',
        'tarea',
        ['usuario_asignado_id', 'fecha_programada', 'is_completed'],
    )
    op.create_index(
        'idx_tarea_fecha_is_completed',
        'tarea',
        ['fecha_programada', 'is_completed'],
    )
    # Partial index for unassigned tasks (WHERE usuario_asignado_id IS NULL)
    op.create_index(
        'idx_tarea_sin_asignar',
        'tarea',
        ['is_completed'],
        postgresql_where=sa.text('usuario_asignado_id IS NULL'),
    )
    # Indexes on FK columns without index
    op.create_index(op.f('ix_tarea_animal_id'), 'tarea', ['animal_id'], unique=False)
    op.create_index(op.f('ix_tarea_habitat_id'), 'tarea', ['habitat_id'], unique=False)
    op.create_index(op.f('ix_tarea_recurrente_id'), 'tarea', ['tarea_recurrente_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_tarea_asignado_fecha_completado', table_name='tarea')
    op.drop_index('idx_tarea_fecha_is_completed', table_name='tarea')
    op.drop_index('idx_tarea_sin_asignar', table_name='tarea')
    op.drop_index(op.f('ix_tarea_animal_id'), table_name='tarea')
    op.drop_index(op.f('ix_tarea_habitat_id'), table_name='tarea')
    op.drop_index(op.f('ix_tarea_recurrente_id'), table_name='tarea')
