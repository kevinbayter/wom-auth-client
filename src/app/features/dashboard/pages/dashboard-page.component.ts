import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { DashboardHeaderComponent } from '../components/dashboard-header/dashboard-header.component';
import { UserStatsCardsComponent } from '../components/user-stats-cards/user-stats-cards.component';
import { UserProfileCardComponent } from '../components/user-profile-card/user-profile-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    UserStatsCardsComponent,
    UserProfileCardComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser$;

  protected readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '??';
    }

    const username = user.username || '';
    const email = user.email || '';

    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    }

    if (email.length >= 2) {
      return email.substring(0, 2).toUpperCase();
    }

    return username.substring(0, 1).toUpperCase() || '?';
  });

  protected async handleRefresh(): Promise<void> {
    try {
      await this.authService.refreshToken();
    } catch (error) {
      console.error('Error refreshing session:', error);
      await this.router.navigate(['/auth/login']);
    }
  }

  protected async handleLogout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      await this.router.navigate(['/auth/login']);
    }
  }

  protected async handleLogoutAll(): Promise<void> {
    try {
      await this.authService.logoutAll();
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error during logout all:', error);
      await this.router.navigate(['/auth/login']);
    }
  }
}
