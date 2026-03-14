import {inject, Injectable} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private _breakpointObserver = inject(BreakpointObserver);

  isDesktopSignal = toSignal(
    this._breakpointObserver
      .observe([Breakpoints.Medium,Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );
}
