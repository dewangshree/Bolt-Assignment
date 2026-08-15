from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.connection import get_db
from app.models.models import CheckoutSubmission, User
from app.schemas.schemas import CheckoutRequest, CheckoutResponse, CheckoutPublic, ErrorResponse

router = APIRouter(prefix="/api/checkout", tags=["checkout"])


@router.post(
    "",
    response_model=CheckoutResponse,
    responses={400: {"model": ErrorResponse}},
    status_code=201,
)
def submit_checkout(body: CheckoutRequest, db: Session = Depends(get_db)):
    # If a user_id was supplied, verify it actually exists
    if body.user_id is not None:
        user = db.query(User).filter(User.id == body.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID provided.",
            )

    submission = CheckoutSubmission(
        user_id=body.user_id,
        email=body.email.lower(),
        phone=body.phone.strip(),
        shipping_address=body.shipping_address.strip(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return CheckoutResponse(
        success=True,
        message="Order details saved successfully.",
        submission=CheckoutPublic.model_validate(submission),
    )
