/**
 * List component for social media feeds with deferred loading for performance.
 */
import {Component, inject, Signal, ChangeDetectionStrategy} from '@angular/core';
import {FeedDTO} from '../../models/meta.dtos';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
