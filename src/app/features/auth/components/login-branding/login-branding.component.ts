import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Presentational component for login branding section.
 * Displays brand information and features.
 */
@Component({
  selector: 'app-login-branding',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './login-branding.component.html',
  styleUrls: ['./login-branding.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginBrandingComponent {
  protected readonly features = [
    { icon: 'verified_user', text: 'Secure & Encrypted' },
    { icon: 'speed', text: 'Fast & Reliable' },
    { icon: 'cloud_done', text: 'Always Available' },
  ];
}
