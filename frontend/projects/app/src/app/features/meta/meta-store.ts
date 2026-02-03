import {computed, inject, Injectable} from '@angular/core';
import {MetaService} from './meta-service';
import {GraphMetaDTO} from './models/graph-meta-dto';

@Injectable({
  providedIn: 'root',
})
export class MetaStore {
   private readonly metaService: MetaService = inject(MetaService);

  private readonly _feedsResource = this.metaService.getFeeds();

  readonly feeds = computed(() => this._feedsResource.value()?.data ?? []);

  readonly isLoading = this._feedsResource.isLoading;

  readonly error = this._feedsResource.error;

  reloadFeeds() {
    this._feedsResource.reload();
  }
}
