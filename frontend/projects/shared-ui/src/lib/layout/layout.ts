import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {Header} from './header/header';
import {Footer} from './footer/footer';
import {MENU_CONFIG, MenuItem} from './menu-config';
import {NavRail} from './nav/nav-rail/nav-rail';
import {BottomBar} from './nav/bottom-bar/bottom-bar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    NavRail,
    BottomBar
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private breakpointObserver = inject(BreakpointObserver);

  // Détection du format mobile (Signal)
  isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, '(max-width: 768px)'])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

}
