"""Initial Phase 2A schema

Revision ID: 20260301_0001
Revises:
Create Date: 2026-03-01 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260301_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


booking_status = sa.Enum("PENDING", "CONFIRMED", "DENIED", name="bookingstatus")
invoice_status = sa.Enum("DRAFT", "SENT", "PAID", name="invoicestatus")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_phone_number", "users", ["phone_number"], unique=True)

    op.create_table(
        "restaurants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("cuisine", sa.String(length=80), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("average_price_per_guest", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_restaurants_id", "restaurants", ["id"], unique=False)
    op.create_index("ix_restaurants_city", "restaurants", ["city"], unique=False)

    booking_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("reservation_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("party_size", sa.Integer(), nullable=False),
        sa.Column("status", booking_status, nullable=False),
        sa.Column("confirmation_code", sa.String(length=6), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_bookings_id", "bookings", ["id"], unique=False)
    op.create_index("ix_bookings_user_id", "bookings", ["user_id"], unique=False)
    op.create_index("ix_bookings_restaurant_id", "bookings", ["restaurant_id"], unique=False)
    op.create_index("ix_bookings_reservation_at", "bookings", ["reservation_at"], unique=False)
    op.create_index("ix_bookings_confirmation_code", "bookings", ["confirmation_code"], unique=True)

    invoice_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("booking_count", sa.Integer(), nullable=False),
        sa.Column("gross_booking_value", sa.Numeric(12, 2), nullable=False),
        sa.Column("commission_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", invoice_status, nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_invoices_id", "invoices", ["id"], unique=False)
    op.create_index("ix_invoices_restaurant_id", "invoices", ["restaurant_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_invoices_restaurant_id", table_name="invoices")
    op.drop_index("ix_invoices_id", table_name="invoices")
    op.drop_table("invoices")

    op.drop_index("ix_bookings_confirmation_code", table_name="bookings")
    op.drop_index("ix_bookings_reservation_at", table_name="bookings")
    op.drop_index("ix_bookings_restaurant_id", table_name="bookings")
    op.drop_index("ix_bookings_user_id", table_name="bookings")
    op.drop_index("ix_bookings_id", table_name="bookings")
    op.drop_table("bookings")

    op.drop_index("ix_restaurants_city", table_name="restaurants")
    op.drop_index("ix_restaurants_id", table_name="restaurants")
    op.drop_table("restaurants")

    op.drop_index("ix_users_phone_number", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")

    invoice_status.drop(op.get_bind(), checkfirst=True)
    booking_status.drop(op.get_bind(), checkfirst=True)
