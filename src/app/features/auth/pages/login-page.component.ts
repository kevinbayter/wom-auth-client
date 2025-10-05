import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@app/core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, ErrorResponse } from '@shared/models';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginBrandingComponent } from '../components/login-branding/login-branding.component';
import { AccountLockedDialogComponent } from '../components/account-locked-dialog/account-locked-dialog.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent,
    LoginBrandingComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly failedAttempts = signal(0);
  protected readonly isRateLimited = signal(false);
  protected readonly rateLimitCountdown = signal(0);
  
  private rateLimitIntervalId?: ReturnType<typeof setInterval>;

  ngOnDestroy(): void {
    if (this.rateLimitIntervalId) {
      clearInterval(this.rateLimitIntervalId);
    }
  }

  protected async handleLogin(credentials: LoginRequest): Promise<void> {
    // Don't allow login if rate limited
    if (this.isRateLimited()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    try {
      await firstValueFrom(this.authService.login(credentials));
      // Reset failed attempts on success
      this.failedAttempts.set(0);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleLoginError(error: HttpErrorResponse): void {
    const status = error?.status;
    const errorResponse = error?.error as ErrorResponse;

    switch (status) {
      case 0:
        this.errorMessage.set('No se pudo conectar con el servidor');
        break;
        
      case 401:
        // Increment failed attempts counter
        this.failedAttempts.update(count => count + 1);
        this.errorMessage.set('Usuario o contraseña inválidos');
        break;
        
      case 403:
        // Account locked - show dialog with countdown
        this.handleAccountLocked(errorResponse);
        break;
        
      case 429:
        // Rate limit - extract retry-after from headers
        this.handleRateLimit(error);
        break;
        
      case 500:
        this.errorMessage.set('Error interno. Intenta nuevamente');
        break;
        
      default:
        this.errorMessage.set(
          errorResponse?.message || 'Ocurrió un error inesperado. Intenta nuevamente'
        );
    }
  }

  private handleAccountLocked(errorResponse: ErrorResponse): void {
    if (errorResponse?.lockedUntil) {
      // Open dialog with locked until timestamp
      this.dialog.open(AccountLockedDialogComponent, {
        data: { lockedUntil: errorResponse.lockedUntil },
        disableClose: true,
        width: '450px',
      });
      
      this.errorMessage.set('Cuenta bloqueada por seguridad');
      // Reset failed attempts since account is locked
      this.failedAttempts.set(0);
    } else {
      this.errorMessage.set('Cuenta bloqueada. Contacta soporte');
    }
  }

  private handleRateLimit(error: HttpErrorResponse): void {
    const retryAfterHeader = error.headers.get('X-Rate-Limit-Retry-After-Seconds');
    const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
    
    this.isRateLimited.set(true);
    this.rateLimitCountdown.set(retryAfterSeconds);
    this.errorMessage.set(`Demasiados intentos. Intenta en ${retryAfterSeconds} segundos`);
    
    // Start countdown
    this.startRateLimitCountdown();
  }

  private startRateLimitCountdown(): void {
    // Clear any existing interval
    if (this.rateLimitIntervalId) {
      clearInterval(this.rateLimitIntervalId);
    }

    this.rateLimitIntervalId = setInterval(() => {
      const currentCountdown = this.rateLimitCountdown();
      
      if (currentCountdown <= 1) {
        // Countdown finished
        this.isRateLimited.set(false);
        this.rateLimitCountdown.set(0);
        this.errorMessage.set(null);
        
        if (this.rateLimitIntervalId) {
          clearInterval(this.rateLimitIntervalId);
          this.rateLimitIntervalId = undefined;
        }
      } else {
        // Decrement countdown
        this.rateLimitCountdown.update(count => count - 1);
      }
    }, 1000); // Update every second
  }
}
