import {Component, computed, inject, input} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {FeedDTO} from '../../models/feedDTO';
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
    MatButton,
    Carousel,
    Media,
    DatePipe,
    MediaPlaceholder
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed {


  feedSignal = input.required<FeedDTO>({
    alias: 'feed'
  });
  attachmentSignal = computed(() => this.feedSignal().attachments.data[0] ?? null)
  private readonly dialog = inject(MatDialog);

  constructor() {
  }

/*  openDialog() {
    const feed = this.feedSignal();
    this.logger.info('Ouverture du dialogue pour le feed');
    this.dialog.open(FeedDialogComponent, {data: {feed: feed}});
    this.logger.debug('Dialogue ouvert avec les données du feed');
  }*/
  protected openDialog() {
    console.log('openDialog');
  }
}
