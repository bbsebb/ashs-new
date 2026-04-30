import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {HallsList} from './halls-list';
import {HallsStore, ViewModelMapperService} from '@shared-api';
import {signal} from '@angular/core';
import {SafePipe} from '../../../../../../../shared-ui/src/lib/pipes/safe.pipe';

/**
 * Unit tests for HallsList component (Public).
 */
describe('HallsList Component (Public)', () => {
  it('should render public halls grid', async () => {
    const mockHalls = [{ id: '1', name: 'Grande Salle', addressCity: 'Hoenheim' }];
    const mockHallsStore = {
      hallsSignal: signal(mockHalls),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    const mockViewModelMapper = {
      hallCardViewModelsSignal: signal(mockHalls.map(h => ({
        id: h.id,
        name: h.name,
        addressStreet: 'Rue',
        addressCityInfo: h.addressCity,
        addressCountry: 'France',
        googleMapsUrl: '',
        googleMapsEmbedUrl: ''
      })))
    };

    await render(HallsList, {
      providers: [
        { provide: HallsStore, useValue: mockHallsStore },
        { provide: ViewModelMapperService, useValue: mockViewModelMapper }
      ],
      imports: [SafePipe]
    });

    expect(screen.getByText(/Nos Salles/i)).toBeDefined();
    expect(screen.getByText('Grande Salle')).toBeDefined();
  });
});
