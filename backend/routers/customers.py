from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Customer

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("/")
def create_customer(
    merchant_id: int,
    name: str,
    email: str = None,
    phone: str = None,
    db: Session = Depends(get_db)
):
    customer = Customer(
        merchant_id=merchant_id,
        name=name,
        email=email,
        phone=phone
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer created successfully",
        "customer_id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone
    }


@router.get("/")
def get_customers(
    db: Session = Depends(get_db)
):
    return db.query(Customer).all()


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer