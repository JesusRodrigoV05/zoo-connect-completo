"""add_password_history_table

Revision ID: 001_add_password_history
Revises: f7662acd6c58
Create Date: 2026-04-29 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "001_add_password_history"
down_revision = (
    'f7662acd6c58', # El merge anterior que ya tenías
    '479ce702d0c4', # Rama de tareas 3
    '53402791f007', # Rama de veterinario 2
    '8e8efd8fcfaf', # Tareas definitivo 4
    'bce8bc40f22b', # Inventario 3
    '47b6d5f2e315'  # Veterinario 4
)
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create password_history table
    op.create_table(
        "password_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("password_hash", sa.String(200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes
    op.create_index(
        "idx_password_history_user_id", "password_history", ["user_id"], unique=False
    )
    op.create_index(
        "idx_password_history_user_created",
        "password_history",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("password_history")
