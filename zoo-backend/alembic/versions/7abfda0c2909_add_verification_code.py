"""add verification code

Revision ID: 7abfda0c2909
Revises: c3f2a9b11e6d
Create Date: 2024-05-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '7abfda0c2909'
down_revision = 'c3f2a9b11e6d'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('verification_code', sa.String(length=10), nullable=True))

def downgrade():
    op.drop_column('users', 'verification_code')
