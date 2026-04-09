import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {PublicPageContainer} from './public-page-container';

describe('PublicPageContainer Component', () => {
  it('should render title, subtitle and eyebrow', async () => {
    await render(PublicPageContainer, {
      componentInputs: {
        title: 'Accueil',
        subtitle: 'Sous-titre',
        eyebrow: 'Club'
      }
    });

    expect(screen.getByText('Accueil')).toBeDefined();
    expect(screen.getByText('Sous-titre')).toBeDefined();
    expect(screen.getByText('Club')).toBeDefined();
  });
});
