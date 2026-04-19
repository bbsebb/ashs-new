import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {StaffMiniCard} from './staff-mini-card';
import {provideRouter} from '@angular/router';
import {APP_CONFIG} from '@shared-api';

/**
 * Unit tests for StaffMiniCard component.
 */
describe('StaffMiniCard Component', () => {
  it('should render staff name and role correctly', async () => {
    await render(StaffMiniCard, {
      componentProperties: {
        staffId: 's1',
        fullName: 'Jean Dupont',
        role: 'Entraîneur',
        avatar: null
      } as any,
      providers: [
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraîneur')).toBeDefined();
  });
});
