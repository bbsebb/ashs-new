import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {HallCard} from '@shared-ui';
import {SafePipe} from '../pipes';
import {HallCardViewModel} from '@shared-api';

/**
 * Unit tests for HallCard component.
 */
describe('HallCard Component', () => {
  const mockViewModel: HallCardViewModel = {
    id: '1',
    name: 'Palais des Sports',
    addressStreet: '123 Rue du Handball',
    addressCityInfo: '67800 Hoenheim',
    addressCountry: 'France',
    googleMapsUrl: 'https://google.com/maps/search/123',
    googleMapsEmbedUrl: 'https://google.com/maps/embed/123'
  };

  it('should render hall name and address correctly', async () => {
    await render(HallCard, {
      componentInputs: {hallCardViewModel: mockViewModel},
      imports: [SafePipe]
    });

    expect(screen.getByText('Palais des Sports')).toBeDefined();
    expect(screen.getByText('123 Rue du Handball')).toBeDefined();
    expect(screen.getByText('67800 Hoenheim')).toBeDefined();
  });

  it('should have a link to Google Maps with correct aria-label', async () => {
    await render(HallCard, {
      componentInputs: {hallCardViewModel: mockViewModel},
      imports: [SafePipe]
    });

    const link = screen.getByRole('link', { name: /ouvrir dans google maps/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe(mockViewModel.googleMapsUrl);
  });
});
