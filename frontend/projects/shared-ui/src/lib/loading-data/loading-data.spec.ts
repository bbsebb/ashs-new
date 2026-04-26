import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {LoadingData} from '@shared-ui';

/**
 * Unit tests for LoadingData component.
 */
describe('LoadingData Component', () => {
  it('should render default label when loading', async () => {
    await render(LoadingData, {
    });

    expect(screen.getByText('Téléchargement des données…')).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render custom label', async () => {
    await render(LoadingData, {
      componentInputs: {
        label: 'Chargement des salles...'
      }
    });

    expect(screen.getByText('Chargement des salles...')).toBeDefined();
  });

});
