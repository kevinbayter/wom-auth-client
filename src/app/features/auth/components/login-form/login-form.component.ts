import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LoginRequest } from '@shared/models';

/**
 * Presentational component for login form.
 * Handles form validation and emits login event.
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  @Input() isLoading = false;
  @Input() errorMessage: string | null = null;
  @Input() 
  set failedAttempts(value: number) {
    this.failedAttemptsSignal.set(value);
  }
  
  @Input()
  set isRateLimited(value: boolean) {
    this.isRateLimitedSignal.set(value);
  }

  @Input()
  set rateLimitCountdown(value: number) {
    this.rateLimitCountdownSignal.set(value);
  }

  @Output() loginSubmit = new EventEmitter<LoginRequest>();

  protected readonly loginForm: FormGroup;
  protected hidePassword = true;
  protected readonly failedAttemptsSignal = signal(0);
  protected readonly isRateLimitedSignal = signal(false);
  protected readonly rateLimitCountdownSignal = signal(0);

  constructor(private readonly fb: FormBuilder) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading && !this.isRateLimitedSignal()) {
      this.loginSubmit.emit(this.loginForm.value as LoginRequest);
    }
  }

  protected get showFailedAttemptsWarning(): boolean {
    return this.failedAttemptsSignal() >= 3;
  }

  protected get remainingAttempts(): number {
    return Math.max(0, 5 - this.failedAttemptsSignal());
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  protected get passwordToggleAriaLabel(): string {
    return this.hidePassword ? 'Mostrar contraseña' : 'Ocultar contraseña';
  }
}
