import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {SeasonCard} from '@shared-ui';
import {Season} from '@shared-domain';
import {DatePipe} from '@angular/common';

/**
 * Unit tests for SeasonCard component.
 * Verifies status chips and date formatting.
 */
describe('SeasonCard Component', () => {
  const mockSeason: Season = {
    id: '1',
    name: '2024-2025',
    startDate: new Date(2024, 8, 1),
    endDate: new Date(2025, 5, 30),
    isCurrent: true,
    isActive: true
  };

  it('should render season name and dates correctly', async () => {
    await render(SeasonCard, {
      componentProperties: {season: mockSeason} as any,
      imports: [DatePipe]
    });

    expect(screen.getByText('2024-2025')).toBeDefined();
    expect(screen.getByText('01/09/2024')).toBeDefined();
    expect(screen.getByText('30/06/2025')).toBeDefined();
  });

  it('should display "Active" and "En cours" chips when applicable', async () => {
    await render(SeasonCard, {
      componentProperties: {season: mockSeason} as any,
      imports: [DatePipe]
    });

    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('En cours')).toBeDefined();
  });

  it('should display "Inactive" chip when not active', async () => {
    await render(SeasonCard, {
      componentProperties: {
        seasonInputSignal: {...mockSeason, isActive: false, isCurrent: false}
      } as any,
      imports: [DatePipe]
    });

    expect(screen.getByText('Inactive')).toBeDefined();
    expect(screen.queryByText('En cours')).toBeNull();
  });
});
