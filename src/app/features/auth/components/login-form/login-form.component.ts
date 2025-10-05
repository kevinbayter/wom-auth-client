import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
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
  @Output() loginSubmit = new EventEmitter<LoginRequest>();

  protected readonly loginForm: FormGroup;
  protected hidePassword = true;

  constructor(private readonly fb: FormBuilder) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.loginSubmit.emit(this.loginForm.value as LoginRequest);
    }
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
