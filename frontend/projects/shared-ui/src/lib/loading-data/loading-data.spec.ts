import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {LoadingData} from '@shared-ui';

/**
 * Unit tests for LoadingData component.
 */
describe('LoadingData Component', () => {
  it('should render default label when loading', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoadingInputSignal: true
      } as any
    });

    expect(screen.getByText('Téléchargement des données…')).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render custom label', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoadingInputSignal: true,
        labelInputSignal: 'Chargement des salles...'
      } as any
    });

    expect(screen.getByText('Chargement des salles...')).toBeDefined();
  });

  it('should not render anything when isLoading is false', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoadingInputSignal: false
      } as any
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});
