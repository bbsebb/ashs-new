import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallsList} from './halls-list';
import {HallsStore, LayoutService} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

/**
 * Unit tests for HallsList component (Admin).
 */
describe('HallsList Component (Admin)', () => {
  const mockHalls = [
    { id: '1', name: 'Gymnase A', addressCity: 'Hoenheim' },
    { id: '2', name: 'Gymnase B', addressCity: 'Bischheim' }
  ];

  const setupMocks = () => {
    return {
      hallsStore: {
        hallsSignal: signal(mockHalls),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
        reload: vi.fn()
      },
      layoutService: {
        isDesktopSignal: signal(true)
      },
      notificationService: {
        show: vi.fn()
      }
    };
  };

  it('should render table with halls data', async () => {
    const mocks = setupMocks();
    await render(HallsList, {
      providers: [
        { provide: HallsStore, useValue: mocks.hallsStore },
        { provide: LayoutService, useValue: mocks.layoutService },
        { provide: NotificationService, useValue: mocks.notificationService },
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText('Gymnase A')).toBeDefined();
    expect(screen.getByText('Gymnase B')).toBeDefined();
  });
});
