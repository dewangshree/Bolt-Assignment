import React, { useState } from 'react';
import { FormInput } from '../components/FormInput';
import { LoginModal } from '../components/LoginModal';
import { checkoutApi, extractErrorMessage } from '../services/api';
import type { UserPublic } from '../services/api';
import { useEmailRecognition } from '../hooks/useEmailRecognition';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  email: string;
  phone: string;
  shipping_address: string;
}

interface FormErrors {
  email?: string;
  phone?: string;
  shipping_address?: string;
}

// ─── Success screen ───────────────────────────────────────────────────────────
const CheckoutSuccess: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="page-content">
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="success-icon">✓</div>
        <div className="badge badge--success" style={{ margin: '0 auto 16px' }}>
          Order Saved
        </div>
        <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
          Order details saved successfully.
        </h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          We've received your checkout information. You'll be contacted once your order is processed.
        </p>
        <button
          id="checkout-success-back-btn"
          className="btn btn--ghost btn--full"
          onClick={onReset}
        >
          ← Submit another order
        </button>
      </div>
    </div>
  </div>
);

// ─── Checkout Page ────────────────────────────────────────────────────────────
interface CheckoutProps {
  onGoRegister: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onGoRegister }) => {
  const [form, setForm] = useState<FormState>({ email: '', phone: '', shipping_address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserPublic | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Email recognition hook (debounced)
  const { recognitionState, recognizedUser, shouldShowModal, dismissModal } =
    useEmailRecognition(form.email);

  const update =
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError('');
      };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.email) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.shipping_address.trim()) next.shipping_address = 'Shipping address is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      await checkoutApi.submit({
        email: form.email,
        phone: form.phone,
        shipping_address: form.shipping_address,
        user_id: loggedInUser?.id ?? null,
      });
      setSubmitted(true);
    } catch (err) {
      setApiError(extractErrorMessage(err, 'Checkout failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: UserPublic) => {
    setLoggedInUser(user);
    dismissModal();
    // Pre-fill email if not already
    setForm((prev) => ({ ...prev, email: user.email }));
  };

  const handleReset = () => {
    setForm({ email: '', phone: '', shipping_address: '' });
    setErrors({});
    setApiError('');
    setLoggedInUser(null);
    setSubmitted(false);
  };

  if (submitted) {
    return <CheckoutSuccess onReset={handleReset} />;
  }

  return (
    <>
      {/* OTP Login Modal */}
      {shouldShowModal && recognizedUser && (
        <LoginModal
          email={form.email}
          recognizedUser={recognizedUser}
          onSuccess={handleLoginSuccess}
          onSkip={dismissModal}
        />
      )}

      <div className="page-content">
        <div className="container container--wide">
          {/* Logged-in banner */}
          {loggedInUser ? (
            <div className="checkout-header-banner">
              <div className="avatar">
                {loggedInUser.first_name[0]}
                {loggedInUser.last_name[0]}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Logged in
                </p>
                <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem', marginTop: '2px' }}>
                  Welcome back, {loggedInUser.first_name} {loggedInUser.last_name}!
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {loggedInUser.email}
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className="badge badge--success">✓ Identified</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="badge badge--primary" style={{ margin: '0 auto 16px' }}>
                🔒 Secure Checkout
              </div>
              <h1 className="heading-xl" style={{ marginBottom: '12px' }}>
                Checkout
              </h1>
              <p className="text-muted">
                Already registered?{' '}
                <span
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={onGoRegister}
                >
                  Enter your email below to be recognised automatically.
                </span>
              </p>
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              {/* ── Section 1: Contact ─────────────────────────────────────── */}
              <div className="section">
                <div className="section__header">
                  <span className="section__number">1</span>
                  <span className="section__title">Contact information</span>
                  {recognitionState === 'recognized' && !loggedInUser && (
                    <span className="section__hint" style={{ color: 'var(--color-success)' }}>Account found</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-email">
                    Email Address
                  </label>
                  <div className="input-wrap">
                    <span className="input-wrap__icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <input
                      id="checkout-email"
                      type="email"
                      className={[
                        'form-input',
                        'form-input--icon',
                        errors.email ? 'form-input--error' : '',
                        recognitionState === 'recognized' ? 'form-input--success' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={update('email')}
                      autoComplete="email"
                      disabled={!!loggedInUser}
                    />
                    {/* Inline status indicator */}
                    {recognitionState === 'checking' && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <span className="spinner" style={{ borderTopColor: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                    {recognitionState === 'recognized' && !loggedInUser && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-success)', fontSize: '1rem' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Recognition status text */}
                  {EMAIL_REGEX.test(form.email) && !loggedInUser && (
                    <>
                      {recognitionState === 'checking' && (
                        <div className="recognition-status recognition-status--checking">
                          <span className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px' }} />
                          Checking your account…
                        </div>
                      )}
                      {recognitionState === 'recognized' && !loggedInUser && (
                        <div className="recognition-status recognition-status--recognized">
                          <span>✓</span>
                          Account found — login to speed up checkout
                        </div>
                      )}
                      {recognitionState === 'unrecognized' && (
                        <div className="recognition-status recognition-status--unrecognized">
                          <span>○</span>
                          Continuing as guest —{' '}
                          <span
                            style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
                            onClick={onGoRegister}
                          >
                            register for faster checkout
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                </div>
              </div>

              {/* ── Section 2: Shipping ────────────────────────────────────── */}
              <div className="section">
                <div className="section__header">
                  <span className="section__number">2</span>
                  <span className="section__title">Shipping details</span>
                </div>

                <FormInput
                  id="checkout-phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={update('phone')}
                  error={errors.phone}
                  autoComplete="tel"
                />

                <div style={{ marginTop: '20px' }}>
                  <FormInput
                    id="checkout-address"
                    label="Shipping Address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={form.shipping_address}
                    onChange={update('shipping_address')}
                    error={errors.shipping_address}
                    multiline
                    rows={3}
                  />
                </div>
              </div>

              {apiError && (
                <div className="alert alert--error" style={{ marginTop: '24px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {apiError}
                </div>
              )}

              {/* ── Section 3: Review & place order ────────────────────────── */}
              <div className="section">
                <div className="section__header">
                  <span className="section__number">3</span>
                  <span className="section__title">Review &amp; place order</span>
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    marginBottom: '20px',
                  }}
                >
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Note
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>
                    This is a demo checkout. No real payment will be processed. Your details will be saved to the database.
                  </p>
                  {loggedInUser && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', marginTop: '6px' }}>
                      ✓ This order will be linked to your account.
                    </p>
                  )}
                </div>

                <button
                  id="checkout-submit-btn"
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Saving order…
                    </>
                  ) : (
                    'Place Order →'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};








// import React, { useState } from 'react';
// import { FormInput } from '../components/FormInput';
// import { LoginModal } from '../components/LoginModal';
// import { checkoutApi, extractErrorMessage } from '../services/api';
// import type { UserPublic } from '../services/api';
// import { useEmailRecognition } from '../hooks/useEmailRecognition';

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// interface FormState {
//   email: string;
//   phone: string;
//   shipping_address: string;
// }

// interface FormErrors {
//   email?: string;
//   phone?: string;
//   shipping_address?: string;
// }

// // ─── Success screen ───────────────────────────────────────────────────────────
// const CheckoutSuccess: React.FC<{ onReset: () => void }> = ({ onReset }) => (
//   <div className="page-content">
//     <div className="container">
//       <div className="card" style={{ textAlign: 'center' }}>
//         <div className="success-icon">✓</div>
//         <div className="badge badge--success" style={{ margin: '0 auto 16px' }}>
//           Order Saved
//         </div>
//         <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
//           Order details saved successfully.
//         </h2>
//         <p className="text-muted" style={{ marginBottom: '32px' }}>
//           We've received your checkout information. You'll be contacted once your order is processed.
//         </p>
//         <button
//           id="checkout-success-back-btn"
//           className="btn btn--ghost btn--full"
//           onClick={onReset}
//         >
//           ← Submit another order
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // ─── Checkout Page ────────────────────────────────────────────────────────────
// interface CheckoutProps {
//   onGoRegister: () => void;
// }

// export const Checkout: React.FC<CheckoutProps> = ({ onGoRegister }) => {
//   const [form, setForm] = useState<FormState>({ email: '', phone: '', shipping_address: '' });
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [apiError, setApiError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [loggedInUser, setLoggedInUser] = useState<UserPublic | null>(null);
//   const [submitted, setSubmitted] = useState(false);

//   // Email recognition hook (debounced)
//   const { recognitionState, recognizedUser, shouldShowModal, dismissModal } =
//     useEmailRecognition(form.email);

//   const update =
//     (field: keyof FormState) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//       setForm((prev) => ({ ...prev, [field]: e.target.value }));
//       if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
//       if (apiError) setApiError('');
//     };

//   const validate = (): boolean => {
//     const next: FormErrors = {};
//     if (!form.email) next.email = 'Email is required';
//     else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
//     if (!form.phone.trim()) next.phone = 'Phone number is required';
//     if (!form.shipping_address.trim()) next.shipping_address = 'Shipping address is required';
//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;
//     setApiError('');
//     setLoading(true);
//     try {
//       await checkoutApi.submit({
//         email: form.email,
//         phone: form.phone,
//         shipping_address: form.shipping_address,
//         user_id: loggedInUser?.id ?? null,
//       });
//       setSubmitted(true);
//     } catch (err) {
//       setApiError(extractErrorMessage(err, 'Checkout failed. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoginSuccess = (user: UserPublic) => {
//     setLoggedInUser(user);
//     dismissModal();
//     // Pre-fill email if not already
//     setForm((prev) => ({ ...prev, email: user.email }));
//   };

//   const handleReset = () => {
//     setForm({ email: '', phone: '', shipping_address: '' });
//     setErrors({});
//     setApiError('');
//     setLoggedInUser(null);
//     setSubmitted(false);
//   };

//   if (submitted) {
//     return <CheckoutSuccess onReset={handleReset} />;
//   }

//   return (
//     <>
//       {/* OTP Login Modal */}
//       {shouldShowModal && recognizedUser && (
//         <LoginModal
//           email={form.email}
//           recognizedUser={recognizedUser}
//           onSuccess={handleLoginSuccess}
//           onSkip={dismissModal}
//         />
//       )}

//       <div className="page-content">
//         <div className="container container--wide">
//           {/* Logged-in banner */}
//           {loggedInUser ? (
//             <div className="checkout-header-banner">
//               <div className="avatar">
//                 {loggedInUser.first_name[0]}
//                 {loggedInUser.last_name[0]}
//               </div>
//               <div>
//                 <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//                   Logged in
//                 </p>
//                 <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
//                   Welcome back, {loggedInUser.first_name} {loggedInUser.last_name}!
//                 </p>
//                 <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
//                   {loggedInUser.email}
//                 </p>
//               </div>
//               <div style={{ marginLeft: 'auto' }}>
//                 <span className="badge badge--success">✓ Identified</span>
//               </div>
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//               <h1 className="heading-xl" style={{ marginBottom: '8px' }}>
//                 Checkout
//               </h1>
//               <p className="text-muted">
//                 Already registered?{' '}
//                 <span
//                   style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
//                   onClick={onGoRegister}
//                 >
//                   Enter your email below to be recognised automatically.
//                 </span>
//               </p>
//             </div>
//           )}

//           <div className="card">
//             <form onSubmit={handleSubmit} noValidate>
//               {/* Email field with recognition status */}
//               <div className="form-group">
//                 <label className="form-label" htmlFor="checkout-email">
//                   Email Address
//                 </label>
//                 <div style={{ position: 'relative' }}>
//                   <input
//                     id="checkout-email"
//                     type="email"
//                     className={[
//                       'form-input',
//                       errors.email ? 'form-input--error' : '',
//                       recognitionState === 'recognized' ? 'form-input--success' : '',
//                     ]
//                       .filter(Boolean)
//                       .join(' ')}
//                     placeholder="your@email.com"
//                     value={form.email}
//                     onChange={update('email')}
//                     autoComplete="email"
//                     disabled={!!loggedInUser}
//                   />
//                   {/* Inline status indicator */}
//                   {recognitionState === 'checking' && (
//                     <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
//                       <span className="spinner" style={{ borderTopColor: 'var(--color-text-muted)' }} />
//                     </div>
//                   )}
//                   {recognitionState === 'recognized' && !loggedInUser && (
//                     <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-success)', fontSize: '1rem' }}>
//                       ✓
//                     </div>
//                   )}
//                 </div>
//                 {/* Recognition status text */}
//                 {EMAIL_REGEX.test(form.email) && !loggedInUser && (
//                   <>
//                     {recognitionState === 'checking' && (
//                       <div className="recognition-status recognition-status--checking">
//                         <span className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px' }} />
//                         Checking your account…
//                       </div>
//                     )}
//                     {recognitionState === 'recognized' && !loggedInUser && (
//                       <div className="recognition-status recognition-status--recognized">
//                         <span>✓</span>
//                         Account found — login to speed up checkout
//                       </div>
//                     )}
//                     {recognitionState === 'unrecognized' && (
//                       <div className="recognition-status recognition-status--unrecognized">
//                         <span>○</span>
//                         Continuing as guest —{' '}
//                         <span
//                           style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
//                           onClick={onGoRegister}
//                         >
//                           register for faster checkout
//                         </span>
//                       </div>
//                     )}
//                   </>
//                 )}
//                 {errors.email && <span className="form-error">⚠ {errors.email}</span>}
//               </div>

//               <div style={{ marginTop: '20px' }}>
//                 <FormInput
//                   id="checkout-phone"
//                   label="Phone Number"
//                   type="tel"
//                   placeholder="+1 (555) 000-0000"
//                   value={form.phone}
//                   onChange={update('phone')}
//                   error={errors.phone}
//                   autoComplete="tel"
//                 />
//               </div>

//               <div style={{ marginTop: '20px' }}>
//                 <FormInput
//                   id="checkout-address"
//                   label="Shipping Address"
//                   placeholder="123 Main St, City, State, ZIP"
//                   value={form.shipping_address}
//                   onChange={update('shipping_address')}
//                   error={errors.shipping_address}
//                   multiline
//                   rows={3}
//                 />
//               </div>

//               {apiError && (
//                 <div className="alert alert--error" style={{ marginTop: '20px' }}>
//                   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
//                     <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
//                     <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                   </svg>
//                   {apiError}
//                 </div>
//               )}

//               <div className="divider" />

//               {/* Order summary note */}
//               <div
//                 style={{
//                   background: 'rgba(255,255,255,0.02)',
//                   border: '1px solid var(--color-border)',
//                   borderRadius: '12px',
//                   padding: '16px',
//                   marginBottom: '20px',
//                 }}
//               >
//                 <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//                   Note
//                 </p>
//                 <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>
//                   This is a demo checkout. No real payment will be processed. Your details will be saved to the database.
//                 </p>
//                 {loggedInUser && (
//                   <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', marginTop: '6px' }}>
//                     ✓ This order will be linked to your account.
//                   </p>
//                 )}
//               </div>

//               <button
//                 id="checkout-submit-btn"
//                 type="submit"
//                 className="btn btn--primary btn--full"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner" />
//                     Saving order…
//                   </>
//                 ) : (
//                   'Place Order →'
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
