import {inject, Injectable} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

/**
 * Service for managing application layout based on breakpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private _breakpointObserver = inject(BreakpointObserver);

  /**
   * Signal indicating if the current screen size is considered "Desktop"
   * (Medium, Large, or XLarge breakpoints).
   */
  isDesktopSignal = toSignal(
    this._breakpointObserver
      .observe([Breakpoints.Medium,Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );
}
