import {computed, inject, Injectable} from '@angular/core';
import {MetaService} from './meta-service';

@Injectable({
  providedIn: 'root',
})
export class MetaStore {
   private readonly metaService: MetaService = inject(MetaService);

  private readonly _feedsResource = this.metaService.getFeeds();

  readonly feedsSignal = computed(() => this._feedsResource.value()?.data ?? []);

  readonly isLoadingSignal = this._feedsResource.isLoading;

  readonly errorSignal = this._feedsResource.error;

  reloadFeeds() {
    this._feedsResource.reload();
  }
}
