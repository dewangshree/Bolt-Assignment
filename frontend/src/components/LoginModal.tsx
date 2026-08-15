import React, { useState } from 'react';
import { OTPInput } from './OTPInput';
import { authApi, extractErrorMessage } from '../services/api';
import type { UserPublic } from '../services/api';

interface Props {
  email: string;
  recognizedUser: UserPublic;
  onSuccess: (user: UserPublic) => void;
  onSkip: () => void;
}

export const LoginModal: React.FC<Props> = ({ email, recognizedUser, onSuccess, onSkip }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otp = digits.join('');
  const isFilled = otp.length === 6 && digits.every(Boolean);

  const handleLogin = async () => {
    if (!isFilled) return;
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, otp);
      if (res.success && res.user) {
        onSuccess(res.user);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed. Please try again.'));
      // Clear digits on wrong OTP so user can retry cleanly
      setDigits(Array(6).fill(''));
      // Auto-focus first cell after short delay
      setTimeout(() => {
        document.getElementById('otp-digit-0')?.focus();
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFilled && !loading) handleLogin();
  };

  const initials = `${recognizedUser.first_name[0]}${recognizedUser.last_name[0]}`.toUpperCase();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" onKeyDown={handleKeyDown}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'white',
              margin: '0 auto 16px',
            }}
          >
            {initials}
          </div>
          <h2 className="heading-md" id="modal-title" style={{ marginBottom: '4px' }}>
            Welcome back! 👋
          </h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            We found an account for{' '}
            <strong style={{ color: 'var(--color-text)' }}>
              {recognizedUser.first_name} {recognizedUser.last_name}
            </strong>
          </p>
        </div>

        {/* OTP prompt */}
        <div style={{ marginBottom: '20px' }}>
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              marginBottom: '16px',
              fontWeight: 500,
            }}
          >
            Enter your 6-digit login code
          </p>
          <OTPInput
            value={digits}
            onChange={setDigits}
            hasError={!!error}
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert--error" style={{ marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, marginTop: '1px' }}>
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 3v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            id="otp-login-btn"
            className="btn btn--primary btn--full"
            onClick={handleLogin}
            disabled={!isFilled || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Verifying…
              </>
            ) : (
              'Login with code'
            )}
          </button>
          <button
            id="otp-skip-btn"
            className="btn btn--ghost btn--full"
            onClick={onSkip}
            disabled={loading}
          >
            Skip for now — continue as guest
          </button>
        </div>

        <p className="text-subtle" style={{ textAlign: 'center', marginTop: '16px' }}>
          Your code was shown after registration
        </p>
      </div>
    </div>
  );
};
