import React, { useState } from 'react';
import { FormInput } from '../components/FormInput';
import { authApi, extractErrorMessage } from '../services/api';
import type { UserPublic } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Success screen shown after registration ──────────────────────────────────
interface SuccessProps {
  user: UserPublic;
  otp: string;
  onProceed: () => void;
}

const RegistrationSuccess: React.FC<SuccessProps> = ({ user, otp, onProceed }) => (
  <div className="page-content">
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="success-icon">✓</div>
        <div className="badge badge--success" style={{ margin: '0 auto 16px' }}>
          Registration Successful
        </div>
        <h1 className="heading-lg" style={{ marginBottom: '8px' }}>
          Welcome, {user.first_name}!
        </h1>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Your account has been created. Save your login code — you'll use it to identify yourself at checkout.
        </p>

        {/* OTP Display */}
        <div
          style={{
            background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: '18px',
            padding: '26px 24px',
            marginBottom: '32px',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Your 6-digit login code
          </p>
          <div className="otp-display">
            {otp.split('').map((digit, i) => (
              <div key={i} className="otp-display__digit">
                {digit}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '16px' }}>
            Keep this code safe — you'll enter it when checking out
          </p>
        </div>

        {/* User info summary */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            padding: '18px 20px',
            marginBottom: '28px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
            {user.first_name[0]}
            {user.last_name[0]}
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account details</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', fontWeight: 600 }}>
              {user.first_name} {user.last_name}
            </p>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{user.email}</p>
          </div>
        </div>

        <button
          id="proceed-to-checkout-btn"
          className="btn btn--primary btn--full"
          onClick={onProceed}
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  </div>
);

// ─── Registration Form ────────────────────────────────────────────────────────
interface RegistrationProps {
  onSuccess: () => void;
}

interface FormState {
  email: string;
  first_name: string;
  last_name: string;
}

interface FormErrors {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export const Registration: React.FC<RegistrationProps> = ({ onSuccess }) => {
  const [form, setForm] = useState<FormState>({ email: '', first_name: '', last_name: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ user: UserPublic; otp: string } | null>(null);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError('');
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.email) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.first_name.trim()) next.first_name = 'First name is required';
    if (!form.last_name.trim()) next.last_name = 'Last name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      setResult({ user: res.user, otp: res.otp });
    } catch (err) {
      setApiError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <RegistrationSuccess user={result.user} otp={result.otp} onProceed={onSuccess} />;
  }

  return (
    <div className="page-content">
      <div className="container">
        {/* Header copy */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge badge--primary" style={{ margin: '0 auto 16px' }}>
            ✦ New Account
          </div>
          <h1 className="heading-xl gradient-text" style={{ marginBottom: '12px' }}>
            Create your account
          </h1>
          <p className="text-muted">
            Register once and check out faster every time.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '22px' }}>
              <p className="section__title" style={{ marginBottom: '2px' }}>Your details</p>
              <p className="text-subtle">We'll use this to identify you at checkout</p>
            </div>

            <div className="registration-name-grid">
              <FormInput
                id="first-name"
                label="First Name"
                placeholder="Jane"
                value={form.first_name}
                onChange={update('first_name')}
                error={errors.first_name}
                autoComplete="given-name"
              />
              <FormInput
                id="last-name"
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                onChange={update('last_name')}
                error={errors.last_name}
                autoComplete="family-name"
              />
            </div>

            <div style={{ marginTop: '18px' }}>
              <FormInput
                id="reg-email"
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
                autoComplete="email"
              />
            </div>

            {apiError && (
              <div className="alert alert--error" style={{ marginTop: '20px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {apiError}
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn--primary btn--full"
              style={{ marginTop: '28px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          <div className="divider" />
          <p className="text-subtle" style={{ textAlign: 'center' }}>
            Already registered?{' '}
            <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={onSuccess}>
              Go to Checkout
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};