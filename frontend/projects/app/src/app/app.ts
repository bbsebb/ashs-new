import {Component, signal} from '@angular/core';
import {Layout} from '@shared-ui';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

/**
 * Root component of the application.
 */
@Component({
  selector: 'app-root',
  imports: [Layout, MatIconButton, MatIcon],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /**
   * Application title signal.
   * Currently set to 'app'.
   */
  protected readonly titleSignal = signal('app');
}
