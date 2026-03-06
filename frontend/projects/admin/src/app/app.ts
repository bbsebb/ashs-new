import {Component, signal} from '@angular/core';
import {Layout} from '@shared-ui';
import {RightMenu} from './core/layout/header/right-menu/right-menu';

@Component({
  selector: 'app-root',
  imports: [Layout, RightMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('admin');
}
