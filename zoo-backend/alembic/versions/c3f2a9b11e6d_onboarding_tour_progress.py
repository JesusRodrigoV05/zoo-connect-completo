"""add onboarding tour progress table

Revision ID: c3f2a9b11e6d
Revises: f7662acd6c58
Create Date: 2026-04-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3f2a9b11e6d"
down_revision: Union[str, Sequence[str], None] = "f7662acd6c58"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "onboarding_tour_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tour_key", sa.String(length=120), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tour_key", name="uq_onboarding_tour_progress_user_tour"),
    )
    op.create_index(
        op.f("ix_onboarding_tour_progress_id"),
        "onboarding_tour_progress",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_onboarding_tour_progress_tour_key"),
        "onboarding_tour_progress",
        ["tour_key"],
        unique=False,
    )
    op.create_index(
        op.f("ix_onboarding_tour_progress_user_id"),
        "onboarding_tour_progress",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_onboarding_tour_progress_user_id"), table_name="onboarding_tour_progress")
    op.drop_index(op.f("ix_onboarding_tour_progress_tour_key"), table_name="onboarding_tour_progress")
    op.drop_index(op.f("ix_onboarding_tour_progress_id"), table_name="onboarding_tour_progress")
    op.drop_table("onboarding_tour_progress")
