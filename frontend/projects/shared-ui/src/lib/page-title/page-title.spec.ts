import { render, screen } from '@testing-library/angular';
import { PageTitle } from './page-title';
import { describe, expect, it } from 'vitest';

describe('PageTitle Component', () => {
  it('should render title and subtitle', async () => {
    await render(PageTitle, {
      componentInputs: {
        title: 'Main Title',
        subtitle: 'Sub Title',
        eyebrow: 'Eyebrow'
      }
    });
    expect(screen.getByText('Main Title')).toBeTruthy();
    expect(screen.getByText('Sub Title')).toBeTruthy();
    expect(screen.getByText('Eyebrow')).toBeTruthy();
  });
});
