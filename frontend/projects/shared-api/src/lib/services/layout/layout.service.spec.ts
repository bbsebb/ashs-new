import {describe, expect, it, beforeEach, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {LayoutService} from './layout.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Subject} from 'rxjs';

describe('LayoutService', () => {
  let service: LayoutService;
  let breakpointObserverMock: any;
  let breakpointSubject: Subject<any>;

  beforeEach(() => {
    breakpointSubject = new Subject();
    breakpointObserverMock = {
      observe: vi.fn(() => breakpointSubject)
    };

    TestBed.configureTestingModule({
      providers: [
        LayoutService,
        { provide: BreakpointObserver, useValue: breakpointObserverMock }
      ]
    });

    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize isDesktopSignal as false', () => {
    expect(service.isDesktopSignal()).toBe(false);
  });

  it('should update isDesktopSignal when breakpoints match', () => {
    breakpointSubject.next({ matches: true });
    expect(service.isDesktopSignal()).toBe(true);

    breakpointSubject.next({ matches: false });
    expect(service.isDesktopSignal()).toBe(false);
  });

  it('should call observe with correct breakpoints', () => {
    expect(breakpointObserverMock.observe).toHaveBeenCalledWith([
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]);
  });
});
