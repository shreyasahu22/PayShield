from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Payment, RiskAssessment, Alert
from datetime import datetime


router = APIRouter(
    prefix="/risk",
    tags=["Risk Assessment"]
)


def calculate_risk_score(
    amount: float,
    recent_payment_count: int,
    failed_payment_count: int,
    duplicate_payment: bool = False
):
    score = 0
    reasons = []

    # 1. Transaction amount
    if amount >= 1000000:
        score += 70
        reasons.append("Extremely high transaction amount")

    elif amount >= 100000:
        score += 50
        reasons.append("Very high transaction amount")

    elif amount >= 50000:
        score += 30
        reasons.append("High transaction amount")

    elif amount >= 20000:
        score += 15
        reasons.append("Elevated transaction amount")


    # 2. Payment velocity
    if recent_payment_count >= 10:
        score += 40
        reasons.append("Very high payment velocity")

    elif recent_payment_count >= 5:
        score += 25
        reasons.append("High payment velocity")


    # 3. Failed payment history
    if failed_payment_count >= 5:
        score += 30
        reasons.append("Multiple recent payment failures")

    elif failed_payment_count >= 2:
        score += 15
        reasons.append("Recent payment failures")


    # 4. Duplicate payment
    if duplicate_payment:
        score += 25
        reasons.append("Possible duplicate payment")


    # Risk classification
    if score >= 70:
        risk_level = "HIGH"

    elif score >= 30:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"


    return {
        "risk_score": min(score, 100),
        "risk_level": risk_level,
        "reasons": reasons
    }


@router.post("/{payment_id}")
def assess_payment_risk(
    payment_id: int,
    db: Session = Depends(get_db)
):

    # Find payment
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )


    # Check existing risk assessment
    existing_assessment = db.query(RiskAssessment).filter(
        RiskAssessment.payment_id == payment_id
    ).first()

    if existing_assessment:

        return {
            "payment_id": existing_assessment.payment_id,
            "risk_score": existing_assessment.risk_score,
            "risk_level": existing_assessment.risk_level,
            "reasons": (
                existing_assessment.explanation.split(", ")
                if existing_assessment.explanation
                else []
            )
        }


    # Count payments by same customer
    recent_payment_count = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id
    ).count()


    # Count failed payments
    failed_payment_count = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id,
        Payment.status == "failed"
    ).count()


    # Check duplicate payment
    duplicate_payment = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id,
        Payment.amount == payment.amount,
        Payment.id != payment_id
    ).first() is not None


    # Calculate risk
    result = calculate_risk_score(
        amount=float(payment.amount),
        recent_payment_count=recent_payment_count,
        failed_payment_count=failed_payment_count,
        duplicate_payment=duplicate_payment
    )


    # Create risk assessment
    assessment = RiskAssessment(
        payment_id=payment_id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        amount_anomaly=0,
        velocity_score=0,
        failure_score=0,
        behaviour_score=0,
        explanation=", ".join(result["reasons"]),
        created_at=datetime.utcnow()
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)


    # Create fraud alert for HIGH risk payment
    if result["risk_level"] == "HIGH":

        existing_alert = db.query(Alert).filter(
            Alert.payment_id == payment_id,
            Alert.status == "open"
        ).first()

        if not existing_alert:

            alert = Alert(
                payment_id=payment_id,
                severity="HIGH",
                message=(
                    "High risk payment detected. "
                    + ", ".join(result["reasons"])
                ),
                status="open",
                created_at=datetime.utcnow()
            )

            db.add(alert)
            db.commit()


    return {
        "payment_id": payment_id,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "reasons": result["reasons"]
    }