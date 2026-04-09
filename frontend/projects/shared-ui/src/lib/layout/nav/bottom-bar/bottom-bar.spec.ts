import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { BottomBar } from './bottom-bar';
import { MENU_CONFIG } from '../../menu-config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [BottomBar],
  template: `<nav app-bottom-bar></nav>`
})
class TestHostComponent {}

describe('BottomBar', () => {
  const mockMenuConfig = [
    { icon: 'home', label: 'Home', path: '/' },
    { icon: 'info', label: 'About', path: '/about' }
  ];

  it('should render menu items from MENU_CONFIG', async () => {
    await render(TestHostComponent, {
      providers: [
        provideRouter([]),
        { provide: MENU_CONFIG, useValue: mockMenuConfig },
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('should have correct links for menu items', async () => {
    await render(TestHostComponent, {
      providers: [
        provideRouter([]),
        { provide: MENU_CONFIG, useValue: mockMenuConfig },
        provideAnimationsAsync('noop')
      ]
    });

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(mockMenuConfig.length);
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[1].getAttribute('href')).toBe('/about');
  });
});
