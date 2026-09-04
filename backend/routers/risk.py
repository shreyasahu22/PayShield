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
    total_customer_payments: int,
    duplicate_payment: bool = False
):
    score = 0
    reasons = []

    # 1. Transaction amount risk
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

    elif recent_payment_count >= 3:
        score += 10
        reasons.append("Elevated payment velocity")


    # 3. Failed payment behaviour
    if failed_payment_count >= 5:
        score += 30
        reasons.append("Multiple recent payment failures")

    elif failed_payment_count >= 2:
        score += 15
        reasons.append("Recent payment failures")

    elif failed_payment_count == 1:
        score += 5
        reasons.append("Previous payment failure detected")


    # 4. Failure ratio
    if total_customer_payments > 0:
        failure_ratio = failed_payment_count / total_customer_payments

        if failure_ratio >= 0.5:
            score += 25
            reasons.append("High customer payment failure ratio")

        elif failure_ratio >= 0.3:
            score += 15
            reasons.append("Elevated customer payment failure ratio")


    # 5. Duplicate transaction
    if duplicate_payment:
        score += 25
        reasons.append("Possible duplicate payment")


    # 6. New customer behaviour
    if total_customer_payments == 1 and amount >= 50000:
        score += 15
        reasons.append("High-value transaction from new customer")


    # Cap score
    score = min(score, 100)


    # Risk classification
    if score >= 70:
        risk_level = "HIGH"

    elif score >= 30:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"


    return {
        "risk_score": score,
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


    # Customer payment history
    customer_payments = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id
    ).all()

    total_customer_payments = len(customer_payments)


    # Payment velocity
    recent_payment_count = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id
    ).count()


    # Failed payment history
    failed_payment_count = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id,
        Payment.status == "failed"
    ).count()


    # Duplicate payment detection
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
        total_customer_payments=total_customer_payments,
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


    # Create fraud alert for HIGH risk
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