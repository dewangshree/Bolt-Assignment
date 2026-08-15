import { useState, useEffect, useRef } from 'react';
import { authApi } from '../services/api';
import type { RecognizeResponse } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEBOUNCE_MS = 500;

export type RecognitionState =
  | 'idle'
  | 'checking'
  | 'recognized'
  | 'unrecognized'
  | 'error';

interface UseEmailRecognitionReturn {
  recognitionState: RecognitionState;
  recognizedUser: RecognizeResponse['user'] | null;
  shouldShowModal: boolean;
  dismissModal: () => void;
}

/**
 * Watches an email string, debounces by DEBOUNCE_MS, then calls /api/auth/recognize.
 * Once the user has skipped the modal for a given email, we won't show it again.
 */
export function useEmailRecognition(email: string): UseEmailRecognitionReturn {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle');
  const [recognizedUser, setRecognizedUser] = useState<RecognizeResponse['user'] | null>(null);
  const [shouldShowModal, setShouldShowModal] = useState(false);

  // Track which emails have been dismissed so we don't re-show
  const skippedEmails = useRef<Set<string>>(new Set());
  // Track the latest request so stale responses are ignored
  const latestEmail = useRef<string>('');

  useEffect(() => {
    const trimmed = email.trim();

    // Reset if email is cleared or invalid
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setRecognitionState('idle');
      setRecognizedUser(null);
      setShouldShowModal(false);
      return;
    }

    const timer = setTimeout(async () => {
      latestEmail.current = trimmed;
      setRecognitionState('checking');
      setShouldShowModal(false);

      try {
        const result = await authApi.recognize(trimmed);

        // Ignore stale responses
        if (latestEmail.current !== trimmed) return;

        if (result.recognized && result.user) {
          setRecognitionState('recognized');
          setRecognizedUser(result.user);
          // Only show modal if user hasn't already skipped this email
          if (!skippedEmails.current.has(trimmed)) {
            setShouldShowModal(true);
          }
        } else {
          setRecognitionState('unrecognized');
          setRecognizedUser(null);
        }
      } catch {
        if (latestEmail.current !== trimmed) return;
        setRecognitionState('error');
        setRecognizedUser(null);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [email]);

  const dismissModal = () => {
    setShouldShowModal(false);
    skippedEmails.current.add(email.trim());
  };

  return { recognitionState, recognizedUser, shouldShowModal, dismissModal };
}
