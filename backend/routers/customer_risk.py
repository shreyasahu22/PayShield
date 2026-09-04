from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Customer, Payment, RiskAssessment

router = APIRouter(
    prefix="/customers",
    tags=["Customer Risk"]
)


@router.get("/{customer_id}/risk")
def get_customer_risk(
    customer_id: int,
    db: Session = Depends(get_db)
):
    # Check customer
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Get customer's payments
    payments = db.query(Payment).filter(
        Payment.customer_id == customer_id
    ).all()

    payment_ids = [payment.id for payment in payments]

    # Get risk assessments
    assessments = []

    if payment_ids:
        assessments = db.query(RiskAssessment).filter(
            RiskAssessment.payment_id.in_(payment_ids)
        ).all()

    # Calculate summary
    total_payments = len(payments)
    total_assessments = len(assessments)

    high_risk_count = sum(
        1 for assessment in assessments
        if assessment.risk_level == "HIGH"
    )

    medium_risk_count = sum(
        1 for assessment in assessments
        if assessment.risk_level == "MEDIUM"
    )

    low_risk_count = sum(
        1 for assessment in assessments
        if assessment.risk_level == "LOW"
    )

    if high_risk_count > 0:
        customer_risk = "HIGH"
    elif medium_risk_count > 0:
        customer_risk = "MEDIUM"
    else:
        customer_risk = "LOW"

    return {
        "customer_id": customer_id,
        "customer_name": customer.name,
        "total_payments": total_payments,
        "risk_assessments": total_assessments,
        "high_risk": high_risk_count,
        "medium_risk": medium_risk_count,
        "low_risk": low_risk_count,
        "customer_risk": customer_risk
    }