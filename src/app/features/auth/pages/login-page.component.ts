import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@app/core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { LoginRequest } from '@shared/models';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginBrandingComponent } from '../components/login-branding/login-branding.component';

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
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async handleLogin(credentials: LoginRequest): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(this.authService.login(credentials));
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleLoginError(error: any): void {
    const status = error?.status;
    const errorMessages: Record<number, string> = {
      0: 'No se pudo conectar con el servidor',
      401: 'Usuario o contraseña inválidos',
      403: 'Cuenta bloqueada. Contacta soporte',
      429: 'Demasiados intentos. Intenta más tarde',
      500: 'Error interno. Intenta nuevamente',
    };
    this.errorMessage.set(
      errorMessages[status] || 'Ocurrió un error inesperado. Intenta nuevamente'
    );
  }
}
