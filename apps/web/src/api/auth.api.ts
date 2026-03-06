import { api, setToken } from "./client.js";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@gastos/shared";

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
