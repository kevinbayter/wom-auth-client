import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@shared/models';

/**
 * Dashboard header component - Presentational
 * Modern toolbar with user menu
 */
@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Input() user: User | null = null;
  @Input() userInitials = '';
  
  @Output() refresh = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() logoutAll = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  onLogoutAll(): void {
    this.logoutAll.emit();
  }
}
