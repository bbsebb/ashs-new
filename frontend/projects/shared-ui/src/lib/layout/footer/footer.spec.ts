import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { Footer } from './footer';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';

import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('Footer', () => {
  it('should render the footer content', async () => {
    await render(Footer, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ],
      imports: [MatIconTestingModule]
    });

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should contain some expected text or icons', async () => {
    await render(Footer, {
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop')
      ],
      imports: [MatIconTestingModule]
    });

    expect(screen.getByText('Mentions légales')).toBeTruthy();
  });
});
