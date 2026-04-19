/**
 * Component for listing all halls in the public app.
 */
import {Component, inject} from '@angular/core';
import {HallsStore} from '@shared-api';
import {ErrorData, HallCard, LoadingData, PublicPageContainer} from '@shared-ui';
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-halls-list',
  imports: [
    LoadingData,
    ErrorData,
    HallCard,
    PublicPageContainer,
    MatIconModule
  ],
  templateUrl: './halls-list.html',
  styleUrl: './halls-list.scss',
})
export class HallsList {
  private readonly hallsStore = inject(HallsStore);
  hallsSignal = this.hallsStore.hallsSignal;
  isLoadingSignal = this.hallsStore.isLoadingSignal;
  errorSignal = this.hallsStore.errorSignal;

  protected retry() {
    this.hallsStore.reload();
  }
}
