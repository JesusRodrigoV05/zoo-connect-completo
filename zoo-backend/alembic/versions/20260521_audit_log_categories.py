"""audit log categories

Revision ID: 20260521_audit_log_categories
Revises: 001_add_password_history
Create Date: 2026-05-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260521_audit_log_categories"
down_revision: Union[str, Sequence[str], None] = "001_add_password_history"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "audit_logs",
        sa.Column("log_type", sa.String(length=50), server_default="security", nullable=False),
    )
    op.add_column("audit_logs", sa.Column("action", sa.String(length=160), nullable=True))
    op.add_column("audit_logs", sa.Column("detail", sa.Text(), nullable=True))
    op.create_index(op.f("ix_audit_logs_log_type"), "audit_logs", ["log_type"], unique=False)

    op.execute(
        """
        UPDATE audit_logs
        SET log_type = 'application'
        WHERE event IN ('role_created', 'role_updated', 'role_deleted')
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_audit_logs_log_type"), table_name="audit_logs")
    op.drop_column("audit_logs", "detail")
    op.drop_column("audit_logs", "action")
    op.drop_column("audit_logs", "log_type")
