import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {HallCard} from './hall-card';
import {Hall} from '@shared-domain';
import {SafePipe} from '../pipes/safe.pipe';

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
      componentInputs: {
        hall: mockHall
      },
      imports: [SafePipe] // Nécessaire car utilisé dans le template
    });

    // Vérifie le titre (Nom de la salle)
    expect(screen.getByText('Palais des Sports')).toBeDefined();

    // Vérifie l'adresse
    expect(screen.getByText(/123 Rue du Handball/)).toBeDefined();
    expect(screen.getByText(/67800 Hoenheim/)).toBeDefined();
  });

  it('should have a link to Google Maps with correct aria-label', async () => {
    await render(HallCard, {
      componentInputs: {
        hall: mockHall
      },
      imports: [SafePipe]
    });

    const link = screen.getByRole('link', { name: /ouvrir dans google maps/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toContain('google.com/maps');
  });
});
