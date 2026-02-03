import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {MatCard,  MatCardContent} from '@angular/material/card';


import {Media} from '../media/media';
import {Carousel} from '../carousel/carousel';


@Component({
  selector: 'app-feed-dialog',
  imports: [
    MatCard,
    MatCardContent,
    Media,
    Carousel
  ],
  templateUrl: './feed-dialog.html',
  styleUrl: './feed-dialog.scss'
})
export class FeedDialog {
  public readonly data = inject(MAT_DIALOG_DATA);
  feed = this.data.feed;
  attachment = this.feed.attachments[0];
}
