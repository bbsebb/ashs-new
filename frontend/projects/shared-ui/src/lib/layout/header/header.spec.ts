import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { Header } from './header';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('Header', () => {
  it('should render the toolbar', async () => {
    const { container } = await render(Header, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    expect(container.querySelector('mat-toolbar')).toBeTruthy();
  });

  it('should contain a link to home', async () => {
    await render(Header, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ]
    });

    const homeLink = screen.getByRole('link');
    expect(homeLink).toBeTruthy();
    expect(homeLink.getAttribute('href')).toBe('/');
  });
});
