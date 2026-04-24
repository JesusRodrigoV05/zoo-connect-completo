"""merge_heads

Revision ID: f7662acd6c58
Revises: 2f9a8d7b1cde, 3bf03dc85234
Create Date: 2026-04-24 02:28:08.763105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7662acd6c58'
down_revision: Union[str, Sequence[str], None] = ('2f9a8d7b1cde', '3bf03dc85234')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
