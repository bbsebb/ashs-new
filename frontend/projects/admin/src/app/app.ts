import {Component, signal} from '@angular/core';
import {Layout} from '@shared-ui';

@Component({
  selector: 'app-root',
  imports: [Layout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('admin');
}
