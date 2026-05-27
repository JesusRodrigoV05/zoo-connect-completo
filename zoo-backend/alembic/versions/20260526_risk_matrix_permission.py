"""add risk matrix persistence

Revision ID: 20260526_risk_matrix_permission
Revises: add_password_changed_at
Create Date: 2026-05-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260526_risk_matrix_permission"
down_revision: Union[str, Sequence[str], None] = "add_password_changed_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "risk_matrix_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset", sa.Text(), nullable=False, server_default=""),
        sa.Column("threat", sa.Text(), nullable=False, server_default=""),
        sa.Column("consequence", sa.Text(), nullable=False, server_default=""),
        sa.Column("probability", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("impact", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("treatment", sa.Text(), nullable=False, server_default="Aceptar"),
        sa.Column("control", sa.Text(), nullable=False, server_default=""),
        sa.Column("control_type", sa.Text(), nullable=False, server_default="P"),
        sa.Column("automation_level", sa.Text(), nullable=False, server_default="M"),
        sa.Column("frequency", sa.Text(), nullable=False, server_default="M"),
        sa.Column("residual_probability", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("residual_impact", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("probability BETWEEN 1 AND 5", name="ck_risk_matrix_probability"),
        sa.CheckConstraint("impact BETWEEN 1 AND 5", name="ck_risk_matrix_impact"),
        sa.CheckConstraint("residual_probability BETWEEN 1 AND 5", name="ck_risk_matrix_residual_probability"),
        sa.CheckConstraint("residual_impact BETWEEN 1 AND 5", name="ck_risk_matrix_residual_impact"),
        sa.CheckConstraint("control_type IN ('P', 'D', 'C', 'Di')", name="ck_risk_matrix_control_type"),
        sa.CheckConstraint("automation_level IN ('A', 'S', 'M')", name="ck_risk_matrix_automation_level"),
        sa.CheckConstraint("frequency IN ('D', 'S', 'M', 'A', 'PT', 'm', 's')", name="ck_risk_matrix_frequency"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_risk_matrix_entries_id"), "risk_matrix_entries", ["id"], unique=False)
    op.create_index(op.f("ix_risk_matrix_entries_created_by_id"), "risk_matrix_entries", ["created_by_id"], unique=False)
    op.create_index(op.f("ix_risk_matrix_entries_updated_by_id"), "risk_matrix_entries", ["updated_by_id"], unique=False)

    op.execute(
        sa.text(
            """
            INSERT INTO permissions (code, name, description, module, is_active)
            VALUES (
                'risk_matrix_access',
                'Matriz de Riesgos',
                'Acceso OSI a la matriz de analisis de riesgos de seguridad de la informacion.',
                'osi',
                TRUE
            )
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                module = EXCLUDED.module,
                is_active = TRUE
            """
        )
    )
    op.execute(
        sa.text(
            """
            INSERT INTO role_permissions (role_id, permission_id, allowed)
            SELECT roles.id, permissions.id, TRUE
            FROM roles
            CROSS JOIN permissions
            WHERE roles.name IN ('administrador', 'osi')
              AND permissions.code = 'risk_matrix_access'
            ON CONFLICT ON CONSTRAINT uq_role_permission DO UPDATE SET
                allowed = TRUE
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            DELETE FROM user_permissions
            WHERE permission_id IN (
                SELECT id FROM permissions WHERE code = 'risk_matrix_access'
            )
            """
        )
    )
    op.execute(
        sa.text(
            """
            DELETE FROM role_permissions
            WHERE permission_id IN (
                SELECT id FROM permissions WHERE code = 'risk_matrix_access'
            )
            """
        )
    )
    op.execute(sa.text("DELETE FROM permissions WHERE code = 'risk_matrix_access'"))
    op.drop_index(op.f("ix_risk_matrix_entries_updated_by_id"), table_name="risk_matrix_entries")
    op.drop_index(op.f("ix_risk_matrix_entries_created_by_id"), table_name="risk_matrix_entries")
    op.drop_index(op.f("ix_risk_matrix_entries_id"), table_name="risk_matrix_entries")
    op.drop_table("risk_matrix_entries")
