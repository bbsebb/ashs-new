import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {AdminPageContainer} from './admin-page-container';

describe('AdminPageContainer Component', () => {
  it('should render title, subtitle and eyebrow', async () => {
    await render(AdminPageContainer, {
      componentInputs: {
        title: 'Gestion',
        subtitle: 'Sous-titre',
        eyebrow: 'Admin'
      }
    });

    expect(screen.getByText('Gestion')).toBeDefined();
    expect(screen.getByText('Sous-titre')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });
});
