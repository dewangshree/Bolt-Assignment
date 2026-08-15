# BoltPay — OTP-Based User Recognition & Checkout

A full-stack, passwordless checkout application. Users register once with their name and email, receive a 6-digit login code, and are automatically recognised by email at checkout — no passwords, ever.

**Live Deployed Application:**
[BoltPay — Live Demo](https://bolt-assignment-pavrgil3z-shreyas-projects-ff372eaf.vercel.app/?utm_source=chatgpt.com)



## Requirements Coverage

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Registration page (first name, last name, email) → saved to DB, triggers OTP flow | ✅ |
| 2 | 6-digit OTP generation, OTP input UI, backend verification, no passwords | ✅ |
| 3 | Checkout page with automatic returning-user recognition by email, order saved to DB, no real payment | ✅ |
| 4 | React + TypeScript + Vite, dark purple/blue fintech UI, responsive, loading/success/error states | ✅ |
| 5 | FastAPI REST API (register, OTP verify, recognize, checkout, health), CORS configured | ✅ |
| 6 | PostgreSQL + SQLAlchemy, `database/schema.sql` checked in, DB credentials via env vars | ✅ |
| 7 | Modular project structure (`backend/app/{api,database,models,schemas}`, `frontend/src/{components,hooks,pages,services}`) | ✅ |
| 8 | No hardcoded secrets; `.env.example` for both frontend and backend; `VITE_API_URL` used | ✅ |
| 9 | Swagger/OpenAPI docs auto-generated at `/docs`; `GET /api/health` present | ✅ |
| 10 | Deployable to Vercel (frontend) / Render (backend) / Supabase (Postgres) | ✅ Instructions below — **confirm your own live URLs are deployed and reachable before submitting** |
| 11 | No real payment, no exposed secrets, functional end-to-end, clear README | ✅ |


---

## Architecture

```
React (Vite + TypeScript)
        ↓  HTTP / Axios
FastAPI (Python + SQLAlchemy)
        ↓  SQLAlchemy ORM
PostgreSQL (Supabase)
```

All three layers are strictly separated. The React frontend **never** communicates directly with Supabase — all data access goes through FastAPI.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Axios               |
| Backend  | Python, FastAPI, Pydantic v2, SQLAlchemy 2      |
| Database | PostgreSQL on Supabase                          |
| Runtime  | Uvicorn (ASGI)                                  |

---

## Project Structure

```
project-root/
├── frontend/               React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     FormInput, Header, OTPInput, LoginModal
│   │   ├── pages/          Registration, Checkout
│   │   ├── services/       api.ts (Axios wrappers)
│   │   ├── hooks/          useEmailRecognition.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
├── backend/                FastAPI Python backend
│   ├── app/
│   │   ├── api/            auth.py, checkout.py
│   │   ├── models/         models.py (SQLAlchemy ORM)
│   │   ├── schemas/        schemas.py (Pydantic)
│   │   ├── database/       connection.py
│   │   ├── config.py       (pydantic-settings)
│   │   └── main.py         (FastAPI app + CORS)
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── schema.sql          PostgreSQL DDL (commit this!)
│
├── prompts.md
├── README.md
└── .gitignore
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- A Supabase project (free tier is fine)

---

### 1 — Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor**.
3. Paste and run the contents of `database/schema.sql`.
4. Copy your **Connection String** from **Settings → Database → Connection string → URI**.

---

### 2 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env and fill in your DATABASE_URL
```

**.env** (backend):
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
GROQ_API_KEY=          # optional
FRONTEND_URL=http://localhost:5173
```

```bash
# Run the backend
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env
cp .env.example .env
# .env is pre-configured for local backend at http://localhost:8000
```

```bash
# Run the frontend
npm run dev
```


## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                              | Required |
|----------------|------------------------------------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string    | ✅       |    
| `FRONTEND_URL` | Allowed frontend CORS origin             | ✅       |


---

## API Endpoints

| Method | Path                    | Description                         |
|--------|-------------------------|-------------------------------------|
| GET    | `/api/health`           | Health check                        |
| POST   | `/api/auth/register`    | Register new user, returns OTP      |
| POST   | `/api/auth/recognize`   | Check if email is registered        |
| POST   | `/api/auth/login`       | Validate OTP, return user info      |
| POST   | `/api/checkout`         | Save checkout submission to DB      |

Full interactive docs: http://localhost:8000/docs

---

## Application Flows

### Flow 1 — Registration

1. User fills in email, first name, last name.
2. Frontend validates all fields.
3. POST `/api/auth/register` →  backend checks for duplicates.
4. Backend generates a random 6-digit OTP, stores it with the user.
5. Response includes the OTP — displayed to the user on a success screen.
6. User can proceed to Checkout.

### Flow 2 — Checkout + User Recognition

1. User starts filling the checkout form.
2. As the user types their email, the frontend debounces (500 ms) and calls `/api/auth/recognize`.
3. If the email belongs to a registered user → OTP login modal appears.
   - **Login**: User enters their 6-digit code → `/api/auth/login` validates it → user is marked as logged in, name shown prominently.
   - **Skip**: Modal is dismissed, user continues as guest. Modal won't re-appear for the same email.
4. User completes email, phone, and shipping address.
5. POST `/api/checkout` → saved to DB with optional `user_id`.
6. Success screen shown.

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
# Build
npm run build

# Deploy via Vercel CLI
npx vercel --prod
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repo, set **Root Directory** to `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   ```
   DATABASE_URL=...    (Supabase connection string)
   GROQ_API_KEY=...    (optional)
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Database → Supabase

Already live — just run `database/schema.sql` in the SQL Editor.

---

## Design Decisions

- **TypeScript over JavaScript** — type safety means faster debugging and cleaner component contracts.
- **SQLAlchemy sync** — simpler than async for a take-home; `psycopg2` is rock-solid on Intel Mac.
- **No JWT / sessions** — the `user_id` is passed from the React state in the checkout payload; no tokens needed for this scope.
- **Debounced recognition** — 500 ms debounce prevents spamming the API on every keystroke.
- **Skip-once per email** — once a user skips the modal for a given email, it won't reappear (tracked in a `useRef` Set).
- **No Groq forced** — the core flows don't genuinely need an LLM, so Groq is wired as an optional env variable but not used.

---

## Known Limitations

- OTP is not rotated after login (in production, invalidate after first use or set an expiry).
- No rate limiting on `/api/auth/login` (add in production).
- Session state lives in React component state — refreshing the page resets it (acceptable for a take-home scope).
- Phone validation is presence-only (format validation would be a production addition).
