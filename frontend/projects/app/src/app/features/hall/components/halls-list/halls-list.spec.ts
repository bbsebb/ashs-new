import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallsList} from './halls-list';
import {HallsStore} from '@shared-api';
import {signal} from '@angular/core';
import {SafePipe} from '../../../../../../../shared-ui/src/lib/pipes/safe.pipe';

describe('HallsList Component (Public)', () => {
  it('should render public halls grid', async () => {
    const mockHalls = [{ id: '1', name: 'Grande Salle', addressCity: 'Hoenheim' }];
    const mockHallsStore = {
      hallsSignal: signal(mockHalls),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    await render(HallsList, {
      providers: [
        { provide: HallsStore, useValue: mockHallsStore }
      ],
      imports: [SafePipe] // For HallCard inside
    });

    expect(screen.getByText('Nos Salles')).toBeDefined();
    expect(screen.getByText('Grande Salle')).toBeDefined();
  });
});
