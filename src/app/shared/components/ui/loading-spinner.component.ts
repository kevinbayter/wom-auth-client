import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

/**
 * Reusable loading spinner component
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
      @if (message) {
        <p class="message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .message {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message?: string;
  @Input() overlay = false;
}
