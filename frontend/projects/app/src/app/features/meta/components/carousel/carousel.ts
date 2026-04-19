/**
 * Interactive carousel for viewing post photo albums.
 */
import {Component, computed, input, signal} from '@angular/core';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Media} from '../media/media';
import {SubAttachmentDTO} from '../../models/meta.dtos';


@Component({
  selector: 'app-carousel',
  imports: [
    MatIcon,
    MatIconButton,
    Media
  ],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel {

  subAttachmentsSignal = input.required<SubAttachmentDTO[]>({alias: 'subAttachments'});
  currentIndexSignal = signal(0);

  readonly lengthSignal = computed(() => this.subAttachmentsSignal().length);

  readonly currentSubAttachmentSignal = computed(() => {
    const items = this.subAttachmentsSignal();
    const len = items.length;
    if (len === 0) return null;
    
    // Ensure index is always within bounds even if items change
    const index = this.currentIndexSignal();
    const safeIndex = ((index % len) + len) % len;
    return items[safeIndex];
  });

  readonly canNavigateSignal = computed(() => this.lengthSignal() > 1);


  prevSlide() {
    this._moveSlide(-1);
  }

  nextSlide() {
    this._moveSlide(1);
  }

  private _moveSlide(delta: number) {
    const len = this.lengthSignal();
    if (len <= 1) return;
    
    this.currentIndexSignal.update((index) => {
      return (index + delta + len) % len;
    });
  }
}
