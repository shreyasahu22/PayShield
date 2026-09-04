from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routers.payments import router as payments_router
from routers.customers import router as customers_router
from routers.auth import router as auth_router
from routers.risk import router as risk_router
from routers.alerts import router as alerts_router
from routers.payment_status import router as payment_status_router
from routers.webhooks import router as webhooks_router
from routers.customer_risk import router as customer_risk_router
from routers.dashboard import router as dashboard_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="PayShield API",
    description="Razorpay Payment Intelligence & Risk Platform",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth_router)
app.include_router(payments_router)
app.include_router(customers_router)
app.include_router(risk_router)
app.include_router(alerts_router)
app.include_router(payment_status_router)
app.include_router(webhooks_router)
app.include_router(customer_risk_router)
app.include_router(dashboard_router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "PayShield API is running"
    }


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }