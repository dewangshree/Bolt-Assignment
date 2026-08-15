import random
import string
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.connection import get_db
from app.models.models import User
from app.schemas.schemas import (
    RegisterRequest,
    RegisterResponse,
    RecognizeRequest,
    RecognizeResponse,
    LoginRequest,
    LoginResponse,
    UserPublic,
    ErrorResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _generate_otp() -> str:
    """Generate a cryptographically random 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=6))


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=RegisterResponse,
    responses={409: {"model": ErrorResponse}},
    status_code=201,
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check for duplicate email (case-insensitive)
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    otp = _generate_otp()

    user = User(
        email=body.email.lower(),
        first_name=body.first_name.strip(),
        last_name=body.last_name.strip(),
        otp_code=otp,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        success=True,
        message="Registration successful",
        user=UserPublic.model_validate(user),
        otp=otp,
    )


# ─── Recognize ────────────────────────────────────────────────────────────────

@router.post("/recognize", response_model=RecognizeResponse)
def recognize(body: RecognizeRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if user:
        return RecognizeResponse(
            success=True,
            recognized=True,
            user=UserPublic.model_validate(user),
            message="User recognized",
        )
    return RecognizeResponse(
        success=True,
        recognized=False,
        message="Email not registered",
    )


# ─── Login (OTP verification) ─────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found for this email.",
        )

    if user.otp_code != body.otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login code. Please try again.",
        )

    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserPublic.model_validate(user),
    )
