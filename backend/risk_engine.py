def calculate_risk_score(
    amount: float,
    recent_payment_count: int,
    failed_payment_count: int,
    duplicate_payment: bool = False
):
    score = 0
    reasons = []

    # 1. Transaction amount
    if amount >= 100000:
        score += 40
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