import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';

import {NgOptimizedImage} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MediaDTO} from '../../models/meta.dtos';
import {VideoEmbedDialog} from './video-embed-dialog';


@Component({
  selector: 'app-media',
  imports: [
    NgOptimizedImage,
    MatIcon
  ],
  templateUrl: './media.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './media.scss'
})
export class Media {
  private readonly _dialog = inject(MatDialog);

  mediaInputSignal = input.required<MediaDTO>({alias: 'media'});
  typeInputSignal = input.required<string>({alias: 'type'});
  priorityInputSignal = input<boolean>(false, {alias: 'priority'});

  openVideo(): void {
    const media = this.mediaInputSignal();
    if (media.embedHtml || media.source) {
      const isPortrait = !!(media.videoWidth && media.videoHeight && media.videoHeight > media.videoWidth);
      this._dialog.open(VideoEmbedDialog, {
        data: {
          embedHtml: media.embedHtml,
          sourceUrl: media.source,
          videoWidth: media.videoWidth,
          videoHeight: media.videoHeight
        },
        width: isPortrait ? '450px' : '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'video-dialog-panel'
      });
    } else {
      console.warn('Cannot open video: neither embedHtml nor source URL is available.');
    }
  }

}

