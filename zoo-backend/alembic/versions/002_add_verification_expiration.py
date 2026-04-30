"""add verification expiration

Revision ID: 002_add_verification_expiration
Revises: 001_add_password_history
Create Date: 2026-04-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_verification_expiration'
down_revision = '001_add_password_history'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('verification_code_expires_at', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('users', 'verification_code_expires_at')
