# PayShield

### Payment Intelligence & Risk Monitoring Platform

PayShield is a payment intelligence and fraud risk monitoring platform built with FastAPI, React, and PostgreSQL.

It helps merchants monitor payments, assess transaction risk, detect suspicious activity, and manage fraud alerts through a centralized dashboard.

---

## Features

- Payment creation and transaction tracking
- Customer management
- Automated payment risk assessment
- Risk scoring based on transaction amount, payment velocity, failures, and duplicate payments
- High-risk fraud alerts
- Alert resolution workflow
- Customer-level risk analysis
- Payment status tracking
- Razorpay webhook event handling
- Real-time monitoring dashboard
- RESTful APIs using FastAPI

---

## Risk Detection

PayShield evaluates transactions using multiple risk indicators:

- Transaction amount
- Payment velocity
- Recent payment failures
- Duplicate payment detection

Each transaction receives:

- Risk Score
- Risk Level: LOW / MEDIUM / HIGH
- Risk Reasons

High-risk transactions can automatically generate fraud alerts.

---

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Razorpay SDK
- REST APIs

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

---

## System Architecture

```text
                 ┌─────────────────────┐
                 │     React Frontend  │
                 │     PayShield UI    │
                 └──────────┬──────────┘
                            │
                            │ REST APIs
                            ▼
                 ┌─────────────────────┐
                 │     FastAPI         │
                 │      Backend        │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       PostgreSQL       Risk Engine     Webhooks
             │              │              │
             │              ▼              │
             │        Risk Assessment       │
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                    Fraud Alerts


Customer
   ↓
Payment Created
   ↓
Risk Assessment
   ↓
Risk Score Generated
   ↓
High Risk?
   ↓
Fraud Alert
   ↓
Merchant Reviews / Resolves Alert


PayShield/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── risk_engine.py
│   │
│   └── routers/
│       ├── auth.py
│       ├── payments.py
│       ├── customers.py
│       ├── customer_risk.py
│       ├── risk.py
│       ├── alerts.py
│       ├── dashboard.py
│       ├── payment_status.py
│       └── webhooks.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── RiskAnalysis.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── Customers.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
