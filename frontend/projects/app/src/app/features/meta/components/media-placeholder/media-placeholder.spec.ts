import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {MediaPlaceholder} from './media-placeholder';

describe('MediaPlaceholder Component', () => {
  it('should render loading text and hint', async () => {
    await render(MediaPlaceholder);

    expect(screen.getByText(/Chargement en cours/i)).toBeDefined();
    expect(screen.getByText(/Clique si le contenu/i)).toBeDefined();
    expect(screen.getByRole('button')).toBeDefined();
  });
});
