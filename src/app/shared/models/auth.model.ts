/**
 * Authentication related models and DTOs
 */

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ErrorResponse {
  path: string;
  error: string;
  message: string;
  timestamp: string;
  status: number;
}

export interface MessageResponse {
  message: string;
}
