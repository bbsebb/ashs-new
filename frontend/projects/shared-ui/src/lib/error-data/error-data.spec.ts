import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {ErrorData} from '@shared-ui';
import userEvent from '@testing-library/user-event';
import {provideRouter} from '@angular/router';

/**
 * Unit tests for ErrorData component.
 */
describe('ErrorData Component', () => {
  it('should render default error message', async () => {
    await render(ErrorData, {
      providers: [provideRouter([])]
    });

    expect(screen.getByText('Impossible de charger la donnée')).toBeDefined();
    expect(screen.getByText('La donnée')).toBeDefined();
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeDefined();
  });

  it('should render custom data name in the error message', async () => {
    await render(ErrorData, {
      componentInputs: {
        dataName: 'la liste des salles'
      },
      providers: [provideRouter([])]
    });

    expect(screen.getByText('Impossible de charger la liste des salles')).toBeDefined();
    expect(screen.getByText('la liste des salles')).toBeDefined();
  });

  it('should emit onRetry when retry button is clicked', async () => {
    const onRetrySpy = vi.fn();

    await render(ErrorData, {
      componentOutputs: {
        onRetry: { emit: onRetrySpy } as any
      },
      providers: [provideRouter([])]
    });

    const user = userEvent.setup();
    const retryButton = screen.getByRole('button', { name: /réessayer/i });

    await user.click(retryButton);

    expect(onRetrySpy).toHaveBeenCalled();
  });
});
