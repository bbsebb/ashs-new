import {render, screen} from '@testing-library/angular';
import {provideRouter, Router} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {BottomBar} from './bottom-bar';
import {MENU_CONFIG} from '../../menu-config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {Component, signal, NgZone} from '@angular/core';
import {TestBed} from '@angular/core/testing';

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

  it('should not mark the home link active when navigated to a subroute', async () => {
    const { fixture } = await render(TestHostComponent, {
      providers: [
        provideRouter([
          { path: '', component: TestHostComponent },
          { path: 'about', component: TestHostComponent }
        ]),
        {provide: MENU_CONFIG, useValue: signal(mockMenuConfig)},
        provideAnimationsAsync('noop')
      ]
    });

    const router = TestBed.inject(Router);
    const ngZone = TestBed.inject(NgZone);

    await ngZone.run(() => router.navigateByUrl('/about'));
    fixture.detectChanges();

    const links = screen.getAllByRole('link');
    // The home link ('/') should not have the 'active' class when we are on '/about'
    expect(links[0].classList.contains('active')).toBeFalsy();
    expect(links[1].classList.contains('active')).toBeTruthy();
  });
});
