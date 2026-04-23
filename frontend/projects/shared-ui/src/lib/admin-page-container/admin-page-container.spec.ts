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

  it('should project content and header actions', async () => {
    await render(`
      <app-admin-page-container title="Test">
        <button header-actions>Action</button>
        <div class="main-content">Content</div>
      </app-admin-page-container>
    `, {
      imports: [AdminPageContainer]
    });

    expect(screen.getByText('Action')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
  });
});
