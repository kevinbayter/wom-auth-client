import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-page.component').then(m => m.DashboardPageComponent),
    canActivate: [authGuard]
  }
];
