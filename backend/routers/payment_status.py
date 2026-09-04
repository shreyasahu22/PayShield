from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Payment

router = APIRouter(
    prefix="/payments",
    tags=["Payment Status"]
)


@router.patch("/{payment_id}/status")
def update_payment_status(
    payment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    allowed_statuses = [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment status"
        )

    payment.status = status

    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment status updated",
        "payment_id": payment.id,
        "status": payment.status
    }
