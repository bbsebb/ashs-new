import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {LoadingData} from './loading-data';

describe('LoadingData Component', () => {
  it('should render default label when loading', async () => {
    await render(LoadingData, {
      componentInputs: {
        isLoading: true
      }
    });

    expect(screen.getByText('Téléchargement des données…')).toBeDefined();
    // Vérification du rôle d'accessibilité
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render custom label', async () => {
    await render(LoadingData, {
      componentInputs: {
        isLoading: true,
        label: 'Chargement des salles...'
      }
    });

    expect(screen.getByText('Chargement des salles...')).toBeDefined();
  });

  it('should not render anything when isLoading is false', async () => {
    await render(LoadingData, {
      componentInputs: {
        isLoading: false
      }
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});
