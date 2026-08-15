from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# ─── Auth / Registration ───────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

    @field_validator("first_name", "last_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be blank")
        return v


class UserPublic(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user: UserPublic
    otp: str


class RecognizeRequest(BaseModel):
    email: EmailStr


class RecognizeResponse(BaseModel):
    success: bool
    recognized: bool
    user: Optional[UserPublic] = None
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    otp: str

    @field_validator("otp")
    @classmethod
    def otp_format(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be a 6-digit number")
        return v


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserPublic] = None


# ─── Checkout ─────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    email: EmailStr
    phone: str
    shipping_address: str
    user_id: Optional[int] = None   # populated if the user logged in

    @field_validator("phone")
    @classmethod
    def phone_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be blank")
        return v

    @field_validator("shipping_address")
    @classmethod
    def address_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Shipping address cannot be blank")
        return v


class CheckoutPublic(BaseModel):
    id: int
    email: str
    phone: str
    shipping_address: str
    user_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckoutResponse(BaseModel):
    success: bool
    message: str
    submission: CheckoutPublic


# ─── Generic error ────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
