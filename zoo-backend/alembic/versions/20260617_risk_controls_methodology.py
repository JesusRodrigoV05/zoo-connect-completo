"""risk controls methodology

Revision ID: 20260617_risk_controls
Revises: 856e3d2521dd
Create Date: 2026-06-17 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260617_risk_controls"
down_revision: Union[str, Sequence[str], None] = "856e3d2521dd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "risk_matrix_entries",
        sa.Column("vulnerability", sa.Text(), nullable=False, server_default=""),
    )
    op.add_column(
        "risk_matrix_entries",
        sa.Column("risk_event", sa.Text(), nullable=False, server_default=""),
    )

    op.create_table(
        "risk_controls",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("risk_matrix_entry_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("control_type", sa.String(length=5), nullable=False),
        sa.Column("automation_level", sa.String(length=5), nullable=False),
        sa.Column("frequency", sa.String(length=5), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "control_type IN ('P', 'D', 'C', 'Di')",
            name="ck_risk_controls_control_type",
        ),
        sa.CheckConstraint(
            "automation_level IN ('A', 'S', 'M')",
            name="ck_risk_controls_automation_level",
        ),
        sa.CheckConstraint(
            "frequency IN ('PT', 'D', 'S', 'M', 'A', 'm', 's')",
            name="ck_risk_controls_frequency",
        ),
        sa.ForeignKeyConstraint(["risk_matrix_entry_id"], ["risk_matrix_entries.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_risk_controls_id"), "risk_controls", ["id"], unique=False)
    op.create_index(
        op.f("ix_risk_controls_risk_matrix_entry_id"),
        "risk_controls",
        ["risk_matrix_entry_id"],
        unique=False,
    )

    op.execute(
        sa.text(
            """
            INSERT INTO risk_controls (
                risk_matrix_entry_id,
                description,
                control_type,
                automation_level,
                frequency
            )
            SELECT
                id,
                control,
                control_type,
                automation_level,
                frequency
            FROM risk_matrix_entries
            WHERE TRIM(COALESCE(control, '')) <> ''
            """
        )
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_risk_controls_risk_matrix_entry_id"), table_name="risk_controls")
    op.drop_index(op.f("ix_risk_controls_id"), table_name="risk_controls")
    op.drop_table("risk_controls")
    op.drop_column("risk_matrix_entries", "risk_event")
    op.drop_column("risk_matrix_entries", "vulnerability")
