import {Component, signal} from '@angular/core';
import {Layout} from '@shared-ui';
import {AuthMenu} from './core/layout/header/auth-menu/auth-menu';

@Component({
  selector: 'app-root',
  imports: [Layout, AuthMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('admin');

}
