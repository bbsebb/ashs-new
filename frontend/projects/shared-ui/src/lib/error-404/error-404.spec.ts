import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { Error404 } from './error-404';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('Error404', () => {
  it('should render default values', async () => {
    await render(Error404, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText('Page introuvable')).toBeTruthy();
    expect(screen.getByText("La page que vous cherchez n'existe pas ou a ete deplacee.")).toBeTruthy();
    expect(screen.getByText("Retour a l'accueil")).toBeTruthy();
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('should render custom input values', async () => {
    await render(Error404, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ],
      componentInputs: {
        title: 'Custom Title',
        message: 'Custom Message',
        homeLabel: 'Go Home'
      }
    });

    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByText('Custom Message')).toBeTruthy();
    expect(screen.getByText('Go Home')).toBeTruthy();
  });

  it('should handle undefined inputs by falling back to defaults', async () => {
    await render(Error404, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ],
      componentInputs: {
        title: undefined,
        message: undefined,
        homeLabel: undefined
      }
    });

    expect(screen.getByText('Page introuvable')).toBeTruthy();
    expect(screen.getByText("La page que vous cherchez n'existe pas ou a ete deplacee.")).toBeTruthy();
    expect(screen.getByText("Retour a l'accueil")).toBeTruthy();
  });
});
