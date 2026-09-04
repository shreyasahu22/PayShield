from fastapi import APIRouter, Depends, Request, Body
from sqlalchemy.orm import Session

from database import get_db
from models import PaymentEvent, Payment

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    # Razorpay event ID
    event_id = request.headers.get(
        "x-razorpay-event-id",
        "local-test-event"
    )

    event_type = payload.get("event", "unknown")

    # Prevent duplicate webhook processing
    existing_event = db.query(PaymentEvent).filter(
        PaymentEvent.event_id == event_id
    ).first()

    if existing_event:
        return {
            "message": "Event already processed",
            "event_id": event_id
        }

    # Get Razorpay payment ID from webhook payload
    payment_entity = (
        payload.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    razorpay_payment_id = payment_entity.get("id")

    # Store webhook event
    payment_event = PaymentEvent(
        event_id=event_id,
        event_type=event_type,
        payload=str(payload),
        processed=False
    )

    db.add(payment_event)

    # Update corresponding payment status
    payment = None

    if razorpay_payment_id:
        payment = db.query(Payment).filter(
            Payment.razorpay_payment_id == razorpay_payment_id
        ).first()

    if payment:

        if event_type == "payment.captured":
            payment.status = "success"

        elif event_type == "payment.failed":
            payment.status = "failed"

        elif event_type == "payment.authorized":
            payment.status = "authorized"

        payment_event.payment_id = payment.id
        payment_event.processed = True

    db.commit()
    db.refresh(payment_event)

    return {
        "message": "Webhook processed successfully",
        "event_id": event_id,
        "event_type": event_type,
        "payment_id": payment.id if payment else None,
        "payment_status": payment.status if payment else None
    }