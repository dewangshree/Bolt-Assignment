# Prompts Used During Development

This file contains the prompts used with LLMs during development of this application.

---

## Prompt 1 — Initial Build Request (2026-08-14)

**Tool:** Antigravity IDE (Claude Sonnet 4.6 Thinking)

**Prompt:**
Build a complete full-stack OTP-Based User Recognition & Checkout application with:
- React + Vite + TypeScript frontend
- FastAPI + SQLAlchemy backend
- PostgreSQL on Supabase database

Flow 1: Registration — collect email, first name, last name; generate and display a 6-digit OTP.
Flow 2: Checkout — debounced email recognition, OTP login modal (skip or login), form submission saved to DB.

Requirements: Three separate layers (React → FastAPI → PostgreSQL), environment variables for all secrets, clean REST API, polished modern UI, responsive design, proper error handling.

---

## Prompt 2 — Implementation Plan Review (2026-08-14)

**Tool:** Antigravity IDE (Claude Sonnet 4.6 Thinking)

**Prompt:**
Review the implementation plan for the OTP checkout app covering:
- Database schema (users, checkout_submissions tables)
- FastAPI endpoints: /api/auth/register, /api/auth/recognize, /api/auth/login, /api/checkout, /api/health
- React components and pages
- Design system with modern CSS
- Deployment preparation for Vercel (frontend) and Render (backend)

Confirm approach and proceed with full implementation.

---

## Prompt 3 — Full Detailed Build Specification (2026-08-15)

**Tool:** Claude (claude.ai)

**Prompt:**
Build a full-stack OTP-based checkout application called BoltPay.
Requirements:
1. USER REGISTRATION
- Create a registration page with:
  - First name
  - Last name
  - Email address
- On registration, save the user in the database.
- Trigger an OTP-based verification/login flow.
2. OTP AUTHENTICATION
- Implement OTP-based user recognition.
- Generate a 6-digit OTP for the user's email.
- Provide an OTP input UI.
- Verify the OTP through the backend.
- After successful verification, recognize the user.
- Do not use passwords.
3. CHECKOUT
- Create a checkout page.
- Returning users should be recognized automatically using their email.
- Display the recognized user's name/email.
- Collect:
  - Email
  - Phone number
  - Shipping address
- Allow the user to place an order.
- Save checkout/order details to the database.
- This is a demo checkout; no real payment should be processed.
4. FRONTEND
- Use React + TypeScript + Vite.
- Create a modern, polished fintech/payment-style UI.
- Dark theme with purple/blue gradients.
- Responsive design.
- Include: Header with BoltPay branding, Register/Checkout step navigation, Registration form, OTP modal/input, User recognition state, Checkout form, Success/error states, Loading states.
- Keep the UI clean and professional rather than overly complicated.
5. BACKEND
- Use Python + FastAPI.
- Create REST APIs for: user registration, OTP generation/verification, email/user recognition, checkout/order submission, health check.
- Configure CORS so the deployed React frontend can communicate with the API.
6. DATABASE
- Use PostgreSQL with SQLAlchemy.
- Store users and checkout/order information.
- Include a database/schema.sql file containing the database schema.
- Use environment variables for database credentials.
7. PROJECT STRUCTURE
Organize the project as: backend/app/{api,database,models,schemas,config.py,main.py}, backend/requirements.txt, backend/.env.example, frontend/src/{components,hooks,pages,services,App.tsx,index.css}, frontend/package.json, frontend/.env.example, database/schema.sql, README.md, prompts.md.
8. ENVIRONMENT VARIABLES
Never hardcode secrets. Use .env files locally and provide .env.example files. Frontend uses VITE_API_URL. Backend uses env vars for the PostgreSQL connection and frontend URL.
9. API
Make the API easy to test through FastAPI Swagger/OpenAPI. Include a health endpoint such as GET /api/health which returns a simple healthy response.
10. DEPLOYMENT
The application should be deployable as: Frontend → Vercel, Backend → Render, Database → PostgreSQL/Supabase. Make sure CORS and environment variables are configured correctly for production.
11. IMPORTANT
- Do not implement real payment processing.
- Do not expose secrets or API keys.
- Keep the application functional end-to-end.
- Make the code modular and easy to understand.
- Provide clear README instructions for local setup and deployment.

---

## Prompt 4 — Original Assignment Brief Cross-Check (2026-08-15)

**Tool:** Claude (claude.ai)

**Prompt:**
OTP Based User Login — Goals:
1. Build a web application with two flows:
   a. Registration Flow — collect the user's email, first name, and last name, and register them. On successful registration, generate a random 6-digit numeric code and display it to the user; they will need this code to log in later.
   b. User Recognition & Login Flow — a checkout form collects email, phone number, and shipping address. As the user types, validate in real time whether a complete, well-formed email address has been entered. Once it has, run a recognition check in the background while the user continues filling out the rest of the form. If the email matches a registered user, show a modal prompting them for their numeric code, with an option to skip and return to the checkout form. Validate the submitted code against the one issued at registration — on a match, log the user in and close the modal, revealing the checkout form; on a mismatch, show an error inside the modal. Once logged in, display the user's name at the top of the checkout form. Submitting the form should simply record the form data in a database table — no real payment processing needed.
2. Deploy the application to the public internet so the team can access it.

Expected Artifacts: a publicly hosted website; a GitHub repository with the full source code (with the boltapp-hiring GitHub user granted access) and the database schema checked in as .sql files; a prompts.md listing every prompt given to an LLM while building the application.

Additional Instructions: 2-day deadline; the application must have distinct frontend, API, and database layers; recommended stack is TypeScript, React, Go, and Postgres (FastAPI/Python substituted for Go); free-tier hosting such as Vercel and Supabase is acceptable.

**Follow-up:** Asked Claude to review the finished codebase against both prompts above, verify full requirement coverage, and produce a polished README.md and updated prompts.md for the GitHub submission.
