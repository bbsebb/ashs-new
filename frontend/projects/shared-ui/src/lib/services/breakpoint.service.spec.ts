import { TestBed } from '@angular/core/testing';
import { BreakpointService } from './breakpoint.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { vi, describe, expect, it } from 'vitest';

describe('BreakpointService', () => {
  it('should return true when Handset matches', () => {
    TestBed.configureTestingModule({
      providers: [
        BreakpointService,
        {
          provide: BreakpointObserver,
          useValue: {
            observe: vi.fn().mockReturnValue(of({ matches: true }))
          }
        }
      ]
    });
    const service = TestBed.inject(BreakpointService);
    expect(service.isHandsetSignal()).toBe(true);
  });
});
