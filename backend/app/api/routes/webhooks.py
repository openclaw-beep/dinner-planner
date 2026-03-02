from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.params import Depends as DependsMarker
from sqlalchemy.orm import Session

from app.api.deps.auth import AdminContext, require_admin, resolve_admin_for_route
from app.core.config import settings
from app.db.session import get_db
from app.schemas.invoice import InvoiceRead
from app.schemas.webhook import ParsedBookingIntent, WhatsAppWebhookPayload
from app.services.invoice_service import create_monthly_invoices
from app.services.nlp_service import parse_booking_intent

router = APIRouter(tags=["integrations"])


@router.post("/webhooks/whatsapp", response_model=ParsedBookingIntent)
def whatsapp_webhook(
    payload: WhatsAppWebhookPayload,
    x_twilio_signature: str | None = Header(None),
) -> ParsedBookingIntent:
    if settings.twilio_auth_token and not x_twilio_signature:
        raise HTTPException(status_code=401, detail="Missing Twilio signature")

    # Signature validation can be layered here once public callback URL is fixed.
    return parse_booking_intent(payload.Body)


@router.post("/invoices/monthly", response_model=list[InvoiceRead])
def generate_monthly_invoices(
    db: Session = Depends(get_db),
    month: str | None = None,
    admin_context: AdminContext | DependsMarker = Depends(require_admin),
) -> list[InvoiceRead]:
    resolve_admin_for_route(admin_context)
    if month:
        try:
            year, month_value = map(int, month.split("-"))
            period_start = date(year, month_value, 1)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail="Invalid month format, expected YYYY-MM") from exc
    else:
        today = date.today().replace(day=1)
        period_start = (today - timedelta(days=1)).replace(day=1)

    next_month = (period_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    period_end = next_month - timedelta(days=1)

    invoices = create_monthly_invoices(db, period_start=period_start, period_end=period_end)
    return [InvoiceRead.model_validate(invoice) for invoice in invoices]
