-- ============================================================
-- OTP-Based User Recognition & Checkout — Database Schema
-- Target: Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension (available on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- users
-- Stores registered users and their one-time login codes.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    otp_code    VARCHAR(6)   NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups (recognition & login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- checkout_submissions
-- Records every checkout form submission.
-- user_id is nullable — guest checkouts are allowed.
-- ============================================================
CREATE TABLE IF NOT EXISTS checkout_submissions (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(30)  NOT NULL,
    shipping_address TEXT         NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for lookups by email and user
CREATE INDEX IF NOT EXISTS idx_checkout_email   ON checkout_submissions(email);
CREATE INDEX IF NOT EXISTS idx_checkout_user_id ON checkout_submissions(user_id);

-- ============================================================
-- Trigger: auto-update users.updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
