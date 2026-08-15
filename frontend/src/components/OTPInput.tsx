import React, { useRef, useCallback } from 'react';

interface Props {
  value: string[];
  onChange: (digits: string[]) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const LENGTH = 6;

export const OTPInput: React.FC<Props> = ({ value, onChange, hasError, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (idx: number) => {
    inputRefs.current[idx]?.focus();
  };

  const handleChange = useCallback(
    (idx: number, raw: string) => {
      // Allow only digits
      const digit = raw.replace(/\D/g, '').slice(-1);
      const next = [...value];
      next[idx] = digit;
      onChange(next);
      if (digit && idx < LENGTH - 1) focus(idx + 1);
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (value[idx]) {
          const next = [...value];
          next[idx] = '';
          onChange(next);
        } else if (idx > 0) {
          focus(idx - 1);
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        focus(idx - 1);
      } else if (e.key === 'ArrowRight' && idx < LENGTH - 1) {
        focus(idx + 1);
      }
    },
    [value, onChange],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
      const next = Array(LENGTH).fill('');
      pasted.split('').forEach((ch, i) => { next[i] = ch; });
      onChange(next);
      // Focus the last filled digit or the next empty one
      const focusIdx = Math.min(pasted.length, LENGTH - 1);
      focus(focusIdx);
    },
    [onChange],
  );

  return (
    <div className="otp-grid" aria-label="6-digit login code input">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className={[
            'otp-digit',
            value[i] ? 'otp-digit--filled' : '',
            hasError ? 'otp-digit--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};
