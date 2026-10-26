// src/services/auth.ts
import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  if (!response.data.access_token) {
    throw new Error("Login response did not include an access token");
  }

  localStorage.setItem("access_token", response.data.access_token);

  return response.data;
};

export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("access_token");
};

export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem("access_token"));
};