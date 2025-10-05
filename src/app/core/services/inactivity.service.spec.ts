import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { InactivityService } from './inactivity.service';

describe('InactivityService', () => {
  let service: InactivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InactivityService]
    });
    service = TestBed.inject(InactivityService);
  });

  afterEach(() => {
    service.stopWatching();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start watching for user activity', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'log');
    
    service.startWatching();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('Inactivity monitoring started')
    );

    // Clean up the timer
    service.stopWatching();
    flush();
  }));

  it('should stop watching and clear timer', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'log');
    
    service.startWatching();
    service.stopWatching();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('Inactivity monitoring stopped')
    );
    
    flush();
  }));

  it('should emit inactivity event after timeout period', fakeAsync(() => {
    let inactivityTriggered = false;
    
    service.onInactivity$.subscribe(() => {
      inactivityTriggered = true;
    });
    
    service.startWatching();
    
    // Fast-forward time by the inactivity timeout (15 minutes)
    tick(15 * 60 * 1000);
    
    expect(inactivityTriggered).toBe(true);
    
    flush();
  }));

  it('should reset timer when user activity is detected', fakeAsync(() => {
    let inactivityTriggered = false;
    
    service.onInactivity$.subscribe(() => {
      inactivityTriggered = true;
    });
    
    service.startWatching();
    
    // Simulate user activity after 10 minutes
    tick(10 * 60 * 1000);
    
    // Simulate mousemove event
    const mouseMoveEvent = new MouseEvent('mousemove');
    document.dispatchEvent(mouseMoveEvent);
    
    // Wait for debounce
    tick(1000);
    
    // Wait another 10 minutes (should not trigger yet, timer was reset)
    tick(10 * 60 * 1000);
    
    expect(inactivityTriggered).toBe(false);
    
    // Now wait the full timeout again
    tick(5 * 60 * 1000);
    
    expect(inactivityTriggered).toBe(true);
    
    flush();
  }));

  // Tests parametrizados para diferentes eventos de usuario
  describe('User Activity Events (Parametrized)', () => {
    const activityEvents = [
      { 
        eventType: 'mousedown', 
        eventClass: MouseEvent, 
        target: () => document,
        description: 'mousedown' 
      },
      { 
        eventType: 'keydown', 
        eventClass: KeyboardEvent, 
        target: () => document,
        description: 'keydown' 
      },
      { 
        eventType: 'touchstart', 
        eventClass: TouchEvent, 
        target: () => document,
        description: 'touchstart' 
      },
      { 
        eventType: 'scroll', 
        eventClass: Event, 
        target: () => document,
        description: 'scroll' 
      },
      { 
        eventType: 'focus', 
        eventClass: Event, 
        target: () => window,
        description: 'window focus' 
      }
    ];

    activityEvents.forEach(({ eventType, eventClass, target, description }) => {
      it(`should reset timer on ${description} event`, fakeAsync(() => {
        let inactivityTriggered = false;
        
        service.onInactivity$.subscribe(() => {
          inactivityTriggered = true;
        });
        
        service.startWatching();
        
        // Simulate event after 10 minutes
        tick(10 * 60 * 1000);
        const event = new eventClass(eventType);
        target().dispatchEvent(event);
        
        tick(1000); // Debounce
        tick(10 * 60 * 1000);
        
        // Should not trigger yet (timer was reset)
        expect(inactivityTriggered).toBe(false);
        
        flush();
      }));
    });
  });

  it('should clear existing watchers when starting new watch', fakeAsync(() => {
    service.startWatching();
    service.startWatching(); // Start again
    
    // Should not have multiple timers running
    let emitCount = 0;
    service.onInactivity$.subscribe(() => {
      emitCount++;
    });
    
    tick(15 * 60 * 1000);
    
    // Should only emit once, not twice
    expect(emitCount).toBeLessThanOrEqual(1);
    
    flush();
  }));

  it('should complete subjects on destroy', () => {
    spyOn(service['destroy$'], 'complete');
    spyOn(service['inactivitySubject$'], 'complete');
    
    service.ngOnDestroy();
    
    expect(service['destroy$'].complete).toHaveBeenCalled();
    expect(service['inactivitySubject$'].complete).toHaveBeenCalled();
  });

  it('should log warning when inactivity timeout is reached', fakeAsync(() => {
    const consoleWarnSpy = spyOn(console, 'warn');
    
    service.startWatching();
    
    tick(15 * 60 * 1000);
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('User inactive for'),
      15,
      'minutes - triggering auto-logout'
    );
    
    flush();
  }));

  it('should debounce rapid user activity events', fakeAsync(() => {
    service.startWatching();
    
    // Simulate rapid mousemove events
    for (let i = 0; i < 10; i++) {
      const event = new MouseEvent('mousemove');
      document.dispatchEvent(event);
      tick(100); // 100ms between events
    }
    
    // Only the last event should trigger timer reset after debounce
    tick(1000); // Debounce time
    
    // Verify no errors occurred
    expect(service).toBeTruthy();
    
    flush();
  }));
});
