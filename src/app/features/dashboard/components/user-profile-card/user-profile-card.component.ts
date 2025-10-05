import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@shared/models';

/**
 * User profile card component - Presentational
 * Displays detailed user information
 */
@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile-card.component.html',
  styleUrls: ['./user-profile-card.component.scss']
})
export class UserProfileCardComponent {
  @Input() user: User | null = null;
  @Input() userInitials = '';
  
  @Output() refresh = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
