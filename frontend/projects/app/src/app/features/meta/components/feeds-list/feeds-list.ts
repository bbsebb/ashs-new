import {Component, inject, Signal} from '@angular/core';
import {FeedDTO} from '../../models/feedDTO';
import {Feed} from '../feed/feed';
import {MetaStore} from '../../meta-store';
import {LoadingData, ErrorData} from '@shared-ui';



@Component({
  selector: 'app-feeds-list',
  imports: [
    Feed,
    ErrorData,
    LoadingData
  ],
  templateUrl: './feeds-list.html',
  styleUrl: './feeds-list.scss',
})
export class FeedsList {
  private readonly metaStore = inject(MetaStore);
  readonly feedsSignal:Signal<FeedDTO[]> = this.metaStore.feedsSignal;
  readonly errorSignal:Signal<Error | undefined> = this.metaStore.errorSignal;
  readonly isLoadingSignal:Signal<boolean> = this.metaStore.isLoadingSignal;

  retry() {
    this.metaStore.reloadFeeds();
  }
}
