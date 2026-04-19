import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {LoadingData} from './loading-data';

/**
 * Unit tests for LoadingData component.
 */
describe('LoadingData Component', () => {
  it('should render default label when loading', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoading: true
      } as any
    });

    expect(screen.getByText('Téléchargement des données…')).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render custom label', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoading: true,
        label: 'Chargement des salles...'
      } as any
    });

    expect(screen.getByText('Chargement des salles...')).toBeDefined();
  });

  it('should not render anything when isLoading is false', async () => {
    await render(LoadingData, {
      componentProperties: {
        isLoading: false
      } as any
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});
