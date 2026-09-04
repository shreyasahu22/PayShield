from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Payment, RiskAssessment, Alert

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):
    total_payments = db.query(Payment).count()

    successful_payments = db.query(Payment).filter(
        Payment.status == "captured"
    ).count()

    failed_payments = db.query(Payment).filter(
        Payment.status == "failed"
    ).count()

    total_risk_assessments = db.query(
        RiskAssessment
    ).count()

    high_risk_payments = db.query(
        RiskAssessment
    ).filter(
        RiskAssessment.risk_level == "HIGH"
    ).count()

    medium_risk_payments = db.query(
        RiskAssessment
    ).filter(
        RiskAssessment.risk_level == "MEDIUM"
    ).count()

    open_alerts = db.query(Alert).filter(
        Alert.status == "open"
    ).count()

    total_transaction_value = sum(
        payment.amount
        for payment in db.query(Payment).all()
    )

    return {
        "total_payments": total_payments,
        "successful_payments": successful_payments,
        "failed_payments": failed_payments,
        "total_risk_assessments": total_risk_assessments,
        "high_risk_payments": high_risk_payments,
        "medium_risk_payments": medium_risk_payments,
        "open_alerts": open_alerts,
        "total_transaction_value": total_transaction_value
    }