import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@app/core/services/auth.service';
import { DashboardHeaderComponent } from '../components/dashboard-header/dashboard-header.component';
import { UserStatsCardsComponent } from '../components/user-stats-cards/user-stats-cards.component';
import { UserProfileCardComponent } from '../components/user-profile-card/user-profile-card.component';

/**
 * Dashboard page component (Smart Container)
 * Loads user data and delegates presentation to child components
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    DashboardHeaderComponent,
    UserStatsCardsComponent,
    UserProfileCardComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser$;
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await firstValueFrom(this.authService.loadCurrentUser());
    } catch (err: any) {
      const errorMessage = err?.userMessage || 'Error al cargar el perfil del usuario';
      this.error.set(errorMessage);
      console.error('Error loading user profile:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

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
    await this.loadUserProfile();
  }

  protected async handleLogout(): Promise<void> {
    try {
      this.isLoading.set(true);
      await firstValueFrom(this.authService.logout());
    } catch (error: any) {
      console.error('Error durante logout:', error);
      this.error.set(error?.userMessage || 'Error al cerrar sesión');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async handleLogoutAll(): Promise<void> {
    try {
      this.isLoading.set(true);
      await firstValueFrom(this.authService.logoutAll());
    } catch (error: any) {
      console.error('Error durante logout masivo:', error);
      this.error.set(error?.userMessage || 'Error al cerrar todas las sesiones');
    } finally {
      this.isLoading.set(false);
    }
  }
}
