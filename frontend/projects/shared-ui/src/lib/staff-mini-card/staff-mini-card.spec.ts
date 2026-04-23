import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {StaffMiniCard} from '@shared-ui';
import {provideRouter} from '@angular/router';
import {StaffMiniCardViewModel} from '@shared-api';

/**
 * Unit tests for StaffMiniCard component.
 */
describe('StaffMiniCard Component', () => {
  const mockViewModel: StaffMiniCardViewModel = {
    id: 's1',
    fullName: 'Jean Dupont',
    roleLabel: 'Entraîneur',
    avatarUrl: null
  };

  it('should render staff name and role correctly', async () => {
    await render(StaffMiniCard, {
      componentInputs: {
        staffMiniCardViewModel: mockViewModel
      },
      providers: [
        provideRouter([])
      ]
    });

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('Entraîneur')).toBeDefined();
  });
});
