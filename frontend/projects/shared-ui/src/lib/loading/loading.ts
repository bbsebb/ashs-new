import {Component, input} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinner],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class LoadingComponent {
  /**
   * Message to display under the spinner.
   */
  message = input<string>('Chargement...');

}
