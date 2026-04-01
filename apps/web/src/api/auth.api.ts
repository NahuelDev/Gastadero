import { api, setToken } from "./client.js";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@gastos/shared";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const result = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<{ message: string }> {
  return api<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<{ message: string }> {
  return api<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
