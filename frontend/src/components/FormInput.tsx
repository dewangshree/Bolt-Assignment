import React from 'react';

interface Props {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
  suffix?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FormInput: React.FC<Props> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  multiline = false,
  rows = 3,
  suffix,
  className = '',
  disabled = false,
}) => {
  const inputClass = [
    'form-input',
    error ? 'form-input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {multiline ? (
          <textarea
            id={id}
            className={inputClass}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        ) : (
          <input
            id={id}
            type={type}
            className={inputClass}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            disabled={disabled}
          />
        )}
        {suffix && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-error">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="6" opacity="0.15" />
            <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};
