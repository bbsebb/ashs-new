import { render, screen } from '@testing-library/angular';
import { TrainingSessionItem } from './training-session-item';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

/**
 * Unit tests for TrainingSessionItem component.
 */
describe('TrainingSessionItem Component', () => {
  it('should render session details', async () => {
    const startTime = new Date();
    startTime.setHours(18, 0);
    const endTime = new Date();
    endTime.setHours(20, 0);

    await render(TrainingSessionItem, {
      providers: [provideRouter([])],
      componentProperties: {
        dayOfWeek: 'MONDAY',
        startTime: startTime,
        endTime: endTime,
        hallName: 'Gymnase A',
        hallId: '123'
      } as any
    });

    expect(screen.getByText(/gymnase a/i)).toBeTruthy();
    expect(screen.queryAllByText(/18:00/)).toBeTruthy();
  });
});
