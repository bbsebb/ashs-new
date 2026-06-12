import {Component, ElementRef, inject, viewChild, ChangeDetectionStrategy} from '@angular/core';

import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';
import {Header} from './header/header';
import {Footer} from './footer/footer';
import {NavRail} from './nav/nav-rail/nav-rail';
import {BottomBar} from './nav/bottom-bar/bottom-bar';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {BreakpointService} from '../services/breakpoint.service';

/**
 * Main application layout component.
 * Manages the high-level structure including Header, Footer, and responsive Navigation (Rail or Bottom Bar).
 * Handles automatic scroll-to-top on route changes.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    Header,
    Footer,
    NavRail,
    BottomBar,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly _breakpointService = inject(BreakpointService);
  private readonly _router = inject(Router);

  /**
   * Signal indicating if the current device is a handset (mobile).
   * Derived from the central BreakpointService.
   */
  readonly isHandsetSignal = this._breakpointService.isHandsetSignal;

  /**
   * Signal referencing the main content element in the template.
   * Used for programmatic scrolling.
   */
  readonly contentEl = viewChild<ElementRef<HTMLElement>>('content');

  constructor() {
    this._router.events
      .pipe(
        // Only listen for successful navigation ends
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        // Automatically unsubscribe when the component is destroyed to prevent memory leaks
        takeUntilDestroyed()
      )
      .subscribe(() => {
        const mainContainer = this.contentEl();

        // Scroll the main content area back to top on every navigation
        if (mainContainer) {
          mainContainer.nativeElement.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
          });
        }
      });
  }
}
