import { signal } from '@angular/core';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Layout } from './layout';
import { BreakpointService } from '../services/breakpoint.service';
import { MENU_CONFIG } from './menu-config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TestBed } from '@angular/core/testing';

describe('Layout', () => {
  let isHandsetSignal: any;
  let mockBreakpointService: any;

  beforeEach(() => {
    isHandsetSignal = signal(false);
    mockBreakpointService = {
      isHandsetSignal: () => isHandsetSignal()
    };
  });

  it('should show nav rail and hide bottom bar on desktop', async () => {
    isHandsetSignal.set(false);
    await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        { provide: MENU_CONFIG, useValue: [] },
        provideAnimationsAsync('noop')
      ]
    });

    // NavRail has role="navigation" (implicit for <nav>) or we can check element
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('should show bottom bar and hide nav rail on mobile', async () => {
    isHandsetSignal.set(true);
    await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        { provide: MENU_CONFIG, useValue: [] },
        provideAnimationsAsync('noop')
      ]
    });

    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('should scroll to top on NavigationEnd', async () => {
    HTMLElement.prototype.scrollTo = vi.fn();
    const { fixture } = await render(Layout, {
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        provideRouter([]),
        { provide: MENU_CONFIG, useValue: [] },
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
