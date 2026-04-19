import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {HallCard} from '@shared-ui';
import {Hall} from '@shared-domain';
import {SafePipe} from '../pipes';

/**
 * Unit tests for HallCard component.
 * Uses componentProperties to bypass Signal input type issues in Testing Library.
 */
describe('HallCard Component', () => {
  const mockHall: Hall = {
    id: '1',
    name: 'Palais des Sports',
    addressStreet: '123 Rue du Handball',
    addressCity: 'Hoenheim',
    addressPostalCode: '67800',
    addressCountry: 'France'
  };

  it('should render hall name and address correctly', async () => {
    await render(HallCard, {
      componentProperties: {hall: mockHall} as any,
      imports: [SafePipe]
    });

    expect(screen.getByText('Palais des Sports')).toBeDefined();
    expect(screen.getByText(/123 Rue du Handball/)).toBeDefined();
    expect(screen.getByText(/67800 Hoenheim/)).toBeDefined();
  });

  it('should have a link to Google Maps with correct aria-label', async () => {
    await render(HallCard, {
      componentProperties: {hallInputSignal: mockHall} as any,
      imports: [SafePipe]
    });

    const link = screen.getByRole('link', { name: /ouvrir dans google maps/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toContain('google.com/maps');
  });
});
