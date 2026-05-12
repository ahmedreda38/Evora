"""add profile_image_url to users

Revision ID: 48064d97715e
Revises: 3aa03f9662b1
Create Date: 2026-05-12 03:58:26.677174

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "48064d97715e"
down_revision: Union[str, Sequence[str], None] = "3aa03f9662b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add profile_image_url column to users table."""
    op.add_column("users", sa.Column("profile_image_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Remove profile_image_url column."""
    op.drop_column("users", "profile_image_url")
