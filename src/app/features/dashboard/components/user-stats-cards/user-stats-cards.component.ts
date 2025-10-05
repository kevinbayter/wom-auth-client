import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@shared/models';

/**
 * User statistics cards component - Presentational
 * Displays account status, authentication and user ID stats
 */
@Component({
  selector: 'app-user-stats-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-stats-cards.component.html',
  styleUrls: ['./user-stats-cards.component.scss']
})
export class UserStatsCardsComponent {
  @Input() user: User | null = null;
}
