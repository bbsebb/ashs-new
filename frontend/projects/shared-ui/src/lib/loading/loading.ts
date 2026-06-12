import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinner],
  templateUrl: './loading.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading.scss'
})
export class LoadingComponent {
  /**
   * Message to display under the spinner.
   */
  messageInputSignal = input<string>('Chargement...', {alias: 'message'});

}
