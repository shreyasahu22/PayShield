from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="merchant")
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="user", uselist=False)


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="merchant")
    customers = relationship("Customer", back_populates="merchant")
    payments = relationship("Payment", back_populates="merchant")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="customers")
    payments = relationship("Payment", back_populates="customer")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)

    razorpay_payment_id = Column(String(100), unique=True, nullable=True, index=True)
    razorpay_order_id = Column(String(100), nullable=True, index=True)

    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), nullable=False)
    payment_method = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    events = relationship("PaymentEvent", back_populates="payment")
    risk_assessment = relationship(
        "RiskAssessment",
        back_populates="payment",
        uselist=False
    )
    alerts = relationship("Alert", back_populates="payment")


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)

    event_id = Column(String(150), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=False)

    processed = Column(Boolean, default=False)
    received_at = Column(DateTime, default=datetime.utcnow)

    payment = relationship("Payment", back_populates="events")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(
        Integer,
        ForeignKey("payments.id"),
        unique=True,
        nullable=False
    )

    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)

    amount_anomaly = Column(Float, default=0)
    velocity_score = Column(Float, default=0)
    failure_score = Column(Float, default=0)
    behaviour_score = Column(Float, default=0)

    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    payment = relationship("Payment", back_populates="risk_assessment")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)

    severity = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="open")

    created_at = Column(DateTime, default=datetime.utcnow)

    payment = relationship("Payment", back_populates="alerts")