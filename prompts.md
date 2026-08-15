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
