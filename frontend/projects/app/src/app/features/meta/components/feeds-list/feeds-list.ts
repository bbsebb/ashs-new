import {Component, inject, Signal} from '@angular/core';
import {FeedDTO} from '../../models/feedDTO';
import {Feed} from '../feed/feed';
import {MetaStore} from '../../meta-store';
import {LoadingData, ErrorData} from '@shared-ui';
import {retry} from 'rxjs';


@Component({
  selector: 'app-feeds-list',
  imports: [
    Feed,
    LoadingData,
    ErrorData
  ],
  templateUrl: './feeds-list.html',
  styleUrl: './feeds-list.scss',
})
export class FeedsList {
  private readonly metaStore = inject(MetaStore);
  readonly feedsSignal:Signal<FeedDTO[]> = this.metaStore.feeds;
  readonly error:Signal<Error | undefined> = this.metaStore.error;
  readonly isLoading:Signal<boolean> = this.metaStore.isLoading;

  retry() {
    this.metaStore.reloadFeeds();
  }
}
