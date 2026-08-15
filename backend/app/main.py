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
        "https://bolt-assignment-bay.vercel.app",
        "https://bolt-assignment-pavrgil3z-shreyas-projects-ff372eaf.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
