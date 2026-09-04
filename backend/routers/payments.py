from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Payment

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/")
def create_payment(
    merchant_id: int,
    customer_id: int,
    amount: float,
    currency: str = "INR",
    payment_method: str = "card",
    db: Session = Depends(get_db)
):
    # Basic validation
    if merchant_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Merchant ID must be greater than 0"
        )

    if customer_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Customer ID must be greater than 0"
        )

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )

    # Maximum transaction amount
    if amount > 10000000:
        raise HTTPException(
            status_code=400,
            detail="Amount cannot exceed ₹1,00,00,000"
        )

    payment = Payment(
        merchant_id=merchant_id,
        customer_id=customer_id,
        amount=amount,
        currency=currency,
        status="created",
        payment_method=payment_method
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment created successfully",
        "payment_id": payment.id,
        "merchant_id": payment.merchant_id,
        "customer_id": payment.customer_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "payment_method": payment.payment_method,
        "status": payment.status
    }


@router.get("/")
def get_payments(
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).order_by(
        Payment.id.desc()
    ).all()

    return payments


@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
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

    return payment