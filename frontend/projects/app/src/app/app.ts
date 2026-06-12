import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {Layout} from '@shared-ui';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

/**
 * Root component of the application.
 */
@Component({
  selector: 'app-root',
  imports: [Layout, MatIconButton, MatIcon, RouterLink],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App {
  /**
   * Application title signal.
   * Currently set to 'app'.
   */
  protected readonly titleSignal = signal('app');
}
