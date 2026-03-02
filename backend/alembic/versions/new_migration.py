"""Add reviews table for verified booking reviews.

Revision ID: 20260302_0002
Revises: 20260301_0001
Create Date: 2026-03-02 16:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260302_0002"
down_revision: Union[str, None] = "20260301_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reviews",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("review_text", sa.Text(), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("booking_id", name="uq_reviews_booking_id"),
    )
    op.create_index("ix_reviews_restaurant_id", "reviews", ["restaurant_id"], unique=False)
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"], unique=False)
    op.create_index("ix_reviews_created_at", "reviews", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reviews_created_at", table_name="reviews")
    op.drop_index("ix_reviews_user_id", table_name="reviews")
    op.drop_index("ix_reviews_restaurant_id", table_name="reviews")
    op.drop_table("reviews")
