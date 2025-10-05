import { Injectable, inject, NgZone } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '@env/environment';

/**
 * Service to detect user inactivity and trigger auto-logout
 * Monitors user interactions (mouse, keyboard, touch) and logs out after configured timeout
 */
@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly ngZone = inject(NgZone);
  
  private readonly INACTIVITY_TIMEOUT = environment.auth.inactivityTimeout;
  private readonly DEBOUNCE_TIME = 1000; // 1 second debounce for activity events
  
  private inactivityTimer: any;
  private destroy$ = new Subject<void>();
  private inactivitySubject$ = new Subject<void>();
  
  /**
   * Observable that emits when user has been inactive for configured timeout
   */
  readonly onInactivity$ = this.inactivitySubject$.asObservable();

  /**
   * Start monitoring user activity
   */
  startWatching(): void {
    this.stopWatching(); // Clear any existing watchers
    
    // Run outside Angular zone to avoid excessive change detection
    this.ngZone.runOutsideAngular(() => {
      // Monitor user activity events
      const activityEvents = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'touchstart'),
        fromEvent(document, 'scroll'),
        fromEvent(window, 'focus')
      );

      // Debounce activity events and reset inactivity timer
      activityEvents
        .pipe(
          debounceTime(this.DEBOUNCE_TIME),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.resetInactivityTimer();
        });

      // Start initial timer
      this.resetInactivityTimer();
    });

    if (!environment.production) {
      console.log(`🕐 Inactivity monitoring started (timeout: ${this.INACTIVITY_TIMEOUT / 1000 / 60} minutes)`);
    }
  }

  /**
   * Stop monitoring user activity
   */
  stopWatching(): void {
    this.destroy$.next();
    this.clearInactivityTimer();
    
    if (!environment.production) {
      console.log('🛑 Inactivity monitoring stopped');
    }
  }

  /**
   * Reset the inactivity timer
   * Called when user activity is detected
   */
  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    
    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => {
        if (!environment.production) {
          console.warn('⏱️ User inactive for', this.INACTIVITY_TIMEOUT / 1000 / 60, 'minutes - triggering auto-logout');
        }
        this.inactivitySubject$.next();
      });
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Clear the inactivity timer
   */
  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.stopWatching();
    this.destroy$.complete();
    this.inactivitySubject$.complete();
  }
}
