import {render, screen} from '@testing-library/angular';
import {provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {NavRail} from './nav-rail';
import {MENU_CONFIG} from '../../menu-config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';

@Component({
  standalone: true,
  imports: [NavRail],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<nav app-nav-rail></nav>`
})
class TestHostComponent {}

describe('NavRail', () => {
  const mockMenuConfig = [
    { icon: 'home', label: 'Home', path: '/' },
    { icon: 'info', label: 'About', path: '/about' }
  ];

  it('should render menu items from MENU_CONFIG Signal', async () => {
    await render(TestHostComponent, {
      providers: [
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal(mockMenuConfig)},
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('should have correct links for menu items from MENU_CONFIG Signal', async () => {
    await render(TestHostComponent, {
      providers: [
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal(mockMenuConfig)},
        provideAnimationsAsync('noop')
      ]
    });

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(mockMenuConfig.length);
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[1].getAttribute('href')).toBe('/about');
  });
});
