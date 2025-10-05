import { Injectable, signal } from '@angular/core';

/**
 * Service responsible for managing authentication tokens.
 * Uses Angular Signals for reactive state management.
 * Access token is stored in memory, refresh token in sessionStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly REFRESH_TOKEN_KEY = 'wom_refresh_token';
  
  private accessToken = signal<string | null>(null);
  
  public readonly accessToken$ = this.accessToken.asReadonly();

  setAccessToken(token: string): void {
    this.accessToken.set(token);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  setRefreshToken(token: string): void {
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.accessToken.set(null);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }
}
