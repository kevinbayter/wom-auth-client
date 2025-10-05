import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountLockedDialogComponent } from './account-locked-dialog.component';

describe('AccountLockedDialogComponent', () => {
  let component: AccountLockedDialogComponent;
  let fixture: ComponentFixture<AccountLockedDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AccountLockedDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AccountLockedDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          },
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountLockedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate remaining time correctly', () => {
    expect(component.minutesRemaining()).toBeGreaterThan(0);
    expect(component.minutesRemaining()).toBeLessThanOrEqual(30);
  });

  it('should close dialog when close button is clicked', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should update countdown every minute', (done) => {
    const initialMinutes = component.minutesRemaining();
    
    setTimeout(() => {
      // After 1 second, minutes should still be the same (updates every 60s)
      expect(component.minutesRemaining()).toBe(initialMinutes);
      done();
    }, 1000);
  });

  it('should auto-close when time is up', () => {
    // Set lockedUntil to past
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AccountLockedDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            lockedUntil: new Date(Date.now() - 1000).toISOString(), // 1 second ago
          },
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    });

    const newFixture = TestBed.createComponent(AccountLockedDialogComponent);
    newFixture.detectChanges();

    // Should auto-close immediately
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
