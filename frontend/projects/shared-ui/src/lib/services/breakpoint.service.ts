import { inject, Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private readonly _breakpointObserver = inject(BreakpointObserver);

  /**
   * isHandsetSignal : Signal qui vaut `true` si l'écran correspond au breakpoint Handset (mobile/petit).
   * Nous incluons également une règle CSS personnalisée pour s'assurer que les écrans jusqu'à 768px
   * soient considérés comme "Handset" dans notre design.
   */
  readonly isHandsetSignal = toSignal(
    this._breakpointObserver
      .observe([Breakpoints.HandsetPortrait, '(max-width: 768px)'])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );
}
