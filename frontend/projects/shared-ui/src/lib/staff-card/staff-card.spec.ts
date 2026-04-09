import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {StaffCard} from './staff-card';
import {Staff} from '@shared-domain';
import {APP_CONFIG} from '@shared-api';

describe('StaffCard Component', () => {
  const mockStaff: Staff = {
    id: 's1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@test.com',
    phone: '0612345678',
    avatarFileName: null
  };

  it('should render staff name, email, and phone correctly', async () => {
    await render(StaffCard, {
      componentInputs: {
        staff: mockStaff
      },
      providers: [
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    // Titre
    expect(screen.getByText('Jean Dupont')).toBeDefined();

    // Informations de contact
    expect(screen.getByText('jean.dupont@test.com')).toBeDefined();
    expect(screen.getByText('0612345678')).toBeDefined();
  });
});
