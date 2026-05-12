"""add customer complaint table

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'customer_complaint',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('batch_number', sa.String(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('qc_validation', sa.String(), nullable=False),
        sa.Column('attachments', sa.String(), nullable=True),
        sa.Column('is_valid', sa.Boolean(), nullable=False),
        sa.Column('createdDate', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updatedDate', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('customer_complaint')
