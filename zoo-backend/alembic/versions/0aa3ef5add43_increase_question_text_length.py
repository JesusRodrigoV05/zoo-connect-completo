"""increase question text length

Revision ID: 0aa3ef5add43
Revises: 20260527_textual_user_pk_sms
Create Date: 2026-05-27 18:29:39.717537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0aa3ef5add43'
down_revision: Union[str, Sequence[str], None] = '20260527_textual_user_pk_sms'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('preguntas_encuesta', 'texto_pregunta',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=255),
               existing_nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('preguntas_encuesta', 'texto_pregunta',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(length=100),
               existing_nullable=False)
