import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AccountLockedDialogData {
  lockedUntil: string; // ISO 8601 timestamp
}

@Component({
  selector: 'app-account-locked-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './account-locked-dialog.component.html',
  styleUrls: ['./account-locked-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLockedDialogComponent implements OnInit, OnDestroy {
  private readonly data = inject<AccountLockedDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AccountLockedDialogComponent>);
  
  readonly minutesRemaining = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.calculateRemainingTime();
    this.intervalId = setInterval(() => {
      this.calculateRemainingTime();
    }, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private calculateRemainingTime(): void {
    const lockedUntil = new Date(this.data.lockedUntil);
    const now = new Date();
    const diffMs = lockedUntil.getTime() - now.getTime();
    const minutes = Math.ceil(diffMs / 60000);
    
    this.minutesRemaining.set(Math.max(0, minutes));
    
    // Auto-close when time is up
    if (minutes <= 0) {
      this.dialogRef.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
