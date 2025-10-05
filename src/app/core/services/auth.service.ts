import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { TokenService } from './token.service';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  MessageResponse,
  User
} from '@shared/models';

/**
 * Authentication service using Angular 18 Signals for state management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  
  private readonly API_URL = `${environment.apiUrl}/auth`;
  
  private isAuthenticated = signal<boolean>(false);
  private currentUser = signal<User | null>(null);
  
  public readonly isAuthenticated$ = this.isAuthenticated.asReadonly();
  public readonly currentUser$ = this.currentUser.asReadonly();

  constructor() {
    this.checkInitialAuthentication();
  }

  private checkInitialAuthentication(): void {
    const hasRefreshToken = !!this.tokenService.getRefreshToken();
    const hasAccessToken = !!this.tokenService.getAccessToken();

    if (hasRefreshToken && !hasAccessToken) {
      // Session recovery: refresh token exists but access token was lost (page reload)
      this.refreshToken().subscribe({
        next: () => {
          this.loadCurrentUser().subscribe();
        },
        error: () => {
          // Refresh token is invalid/expired, clear everything
          this.clearAuthState();
        }
      });
    } else if (hasAccessToken && hasRefreshToken) {
      // Both tokens exist, load user profile
      this.isAuthenticated.set(true);
      this.loadCurrentUser().subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.tokenService.setAccessToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.isAuthenticated.set(true);
      }),
      catchError(error => {
        this.isAuthenticated.set(false);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(
      `${this.API_URL}/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.tokenService.setAccessToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.isAuthenticated.set(true);
      }),
      catchError(error => {
        this.logout().subscribe();
        return throwError(() => error);
      })
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
      }),
      catchError(error => {
        this.currentUser.set(null);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<MessageResponse>(`${this.API_URL}/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => throwError(() => new Error('Logout failed'))),
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  logoutAll(): Observable<void> {
    return this.http.post<MessageResponse>(`${this.API_URL}/logout-all`, {}).pipe(
      map(() => void 0),
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  private clearAuthState(): void {
    this.tokenService.clearTokens();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  isAuth(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
