/**
 * Component displaying an Instagram post (feed).
 */
import {Component, computed, input, ChangeDetectionStrategy} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {FeedDTO} from '../../models/meta.dtos';
import {Carousel} from '../carousel/carousel';
import {Media} from '../media/media';
import {DatePipe} from '@angular/common';
import {MediaPlaceholder} from '../media-placeholder/media-placeholder';


@Component({
  selector: 'app-feed',
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    Carousel,
    Media,
    DatePipe,
    MediaPlaceholder
  ],
  templateUrl: './feed.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './feed.scss'
})
export class Feed {


  feedInputSignal = input.required<FeedDTO>({
    alias: 'feed'
  });
  attachmentSignal = computed(() => this.feedInputSignal().attachments.data[0] ?? null)

  // private readonly dialog = inject(MatDialog);

  constructor() {
  }

  /*  openDialog() {
      const feed = this.feedSignal();
      this.logger.info('Ouverture du dialogue pour le feed');
      this.dialog.open(FeedDialogComponent, {data: {feed: feed}});
      this.logger.debug('Dialogue ouvert avec les données du feed');
    }*/

}
