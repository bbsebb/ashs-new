import {signal} from '@angular/core';
import {NavigationEnd, provideRouter, Router} from '@angular/router';
import {render} from '@testing-library/angular';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {Layout} from './layout';
import {BreakpointService} from '../services/breakpoint.service';
import {MENU_CONFIG} from './menu-config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {TestBed} from '@angular/core/testing';

describe('Layout', () => {
  let isHandsetSignal: any;
  let mockBreakpointService: any;

  beforeAll(() => {
    // Mock scrollTo which is not implemented in JSDOM
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  beforeEach(() => {
    isHandsetSignal = signal(false);
    mockBreakpointService = {
      isHandsetSignal: () => isHandsetSignal()
    };
  });

  it('should show nav rail and hide bottom bar on desktop', async () => {
    isHandsetSignal.set(false);
    const {container} = await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal([])},
        provideAnimationsAsync('noop')
      ]
    });

    expect(container.querySelector('[app-nav-rail]')).toBeTruthy();
    expect(container.querySelector('[app-bottom-bar]')).toBeFalsy();
  });

  it('should show bottom bar and hide nav rail on mobile', async () => {
    isHandsetSignal.set(true);
    const {container} = await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal([])},
        provideAnimationsAsync('noop')
      ]
    });

    expect(container.querySelector('[app-bottom-bar]')).toBeTruthy();
    expect(container.querySelector('[app-nav-rail]')).toBeFalsy();
  });

  it('should scroll to top on NavigationEnd', async () => {
    const { fixture } = await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal([])},
        provideAnimationsAsync('noop')
      ]
    });

    const layoutComponent = fixture.componentInstance;
    const contentEl = layoutComponent.contentEl();
    const scrollToSpy = vi.spyOn(contentEl!.nativeElement, 'scrollTo');

    const router = TestBed.inject(Router);
    (router.events as any).next(new NavigationEnd(1, '/', '/'));

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  });
});
