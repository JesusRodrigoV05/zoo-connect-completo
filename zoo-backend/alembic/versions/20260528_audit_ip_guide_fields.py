"""audit ip guide fields

Revision ID: 20260528_audit_ip_guide_fields
Revises: 0aa3ef5add43
Create Date: 2026-05-28
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260528_audit_ip_guide_fields"
down_revision: Union[str, Sequence[str], None] = "0aa3ef5add43"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("ip_address", sa.String(length=45), nullable=True))
    op.add_column("audit_logs", sa.Column("ip_country", sa.String(length=120), nullable=True))
    op.add_column("audit_logs", sa.Column("ip_asn", sa.Integer(), nullable=True))
    op.add_column("audit_logs", sa.Column("ip_organization", sa.String(length=255), nullable=True))
    op.add_column("audit_logs", sa.Column("ip_guide_data", sa.JSON(), nullable=True))
    op.create_index(op.f("ix_audit_logs_ip_address"), "audit_logs", ["ip_address"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_audit_logs_ip_address"), table_name="audit_logs")
    op.drop_column("audit_logs", "ip_guide_data")
    op.drop_column("audit_logs", "ip_organization")
    op.drop_column("audit_logs", "ip_asn")
    op.drop_column("audit_logs", "ip_country")
    op.drop_column("audit_logs", "ip_address")
