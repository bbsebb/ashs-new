import { Component, input } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-data',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-data.html',
  styleUrl: './loading-data.scss',
})
export class LoadingData {
  //TODO design à revoir
  isLoading = input<boolean>(true);
  label = input<string>('Téléchargement des données…');

}
