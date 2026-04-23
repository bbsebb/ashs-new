import {render, screen} from '@testing-library/angular';
import {provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {Footer} from './footer';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

import {MatIconTestingModule} from '@angular/material/icon/testing';

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

    expect(screen.getByText(/mentions légales/i)).toBeTruthy();
  });
});
