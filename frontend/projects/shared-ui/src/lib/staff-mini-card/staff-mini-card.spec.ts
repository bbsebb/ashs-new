import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {StaffMiniCard} from './staff-mini-card';
import {provideRouter} from '@angular/router';
import {APP_CONFIG} from '@shared-api';

describe('StaffMiniCard Component', () => {
  it('should render staff name and role correctly', async () => {
    await render(StaffMiniCard, {
      inputs: {
        staffId: 's1',
        fullName: 'Jean Dupont',
        role: 'Entraîneur',
        avatar: null
      },
      providers: [
        provideRouter([]), // Provide router for routerLink
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraîneur')).toBeDefined();
  });
});
