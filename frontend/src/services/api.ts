import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: UserPublic;
  otp: string;
}

export interface RecognizeResponse {
  success: boolean;
  recognized: boolean;
  user?: UserPublic;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserPublic;
}

export interface CheckoutSubmission {
  id: number;
  email: string;
  phone: string;
  shipping_address: string;
  user_id: number | null;
  created_at: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  submission: CheckoutSubmission;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (data: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>('/api/auth/register', data);
    return res.data;
  },

  recognize: async (email: string): Promise<RecognizeResponse> => {
    const res = await api.post<RecognizeResponse>('/api/auth/recognize', { email });
    return res.data;
  },

  login: async (email: string, otp: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', { email, otp });
    return res.data;
  },
};

export const checkoutApi = {
  submit: async (data: {
    email: string;
    phone: string;
    shipping_address: string;
    user_id?: number | null;
  }): Promise<CheckoutResponse> => {
    const res = await api.post<CheckoutResponse>('/api/checkout', data);
    return res.data;
  },
};

// ─── Error helper ─────────────────────────────────────────────────────────────

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
