import {render, screen} from '@testing-library/angular';
import {TrainingSessionItem} from '@shared-ui';
import {provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {TeamTrainingSessionViewModel} from '@shared-api';

/**
 * Unit tests for TrainingSessionItem component.
 */
describe('TrainingSessionItem Component', () => {
  it('should render session details', async () => {
    const startTime = new Date();
    startTime.setHours(18, 0);
    const endTime = new Date();
    endTime.setHours(20, 0);

    const mockViewModel: TeamTrainingSessionViewModel = {
      dayOfWeek: 'MONDAY',
      startTime: startTime,
      endTime: endTime,
      hallName: 'Gymnase A',
      hallId: '123'
    };

    await render(TrainingSessionItem, {
      providers: [provideRouter([])],
      componentInputs: {
        trainingSessionViewModel: mockViewModel
      }
    });

    expect(screen.getByText(/gymnase a/i)).toBeTruthy();
    expect(screen.queryAllByText(/18:00/)).toBeTruthy();
  });
});
