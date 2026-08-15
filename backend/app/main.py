from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, checkout

app = FastAPI(
    title="OTP Checkout API",
    description="OTP-based user recognition and checkout backend",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allows the React frontend (local dev or deployed) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(checkout.router)


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "otp-checkout-api"}
