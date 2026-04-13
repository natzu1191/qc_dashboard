"""add disposition and resample columns

Revision ID: a1b2c3d4e5f6
Revises: 203dc770b34a
Create Date: 2026-04-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '203dc770b34a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('qc_case', sa.Column('result_after_resample', sa.Float(), nullable=True))
    op.add_column('qc_case', sa.Column('disposition_result', sa.String(), nullable=True))
    op.add_column('qc_case', sa.Column('disposition_conditions', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('qc_case', 'disposition_conditions')
    op.drop_column('qc_case', 'disposition_result')
    op.drop_column('qc_case', 'result_after_resample')
