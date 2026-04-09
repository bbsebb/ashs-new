import {Component, computed, effect, input, signal} from '@angular/core';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Media} from '../media/media';
import {SubAttachmentsDTO} from '../../models/subAttachementsDTO';
import {AttachmentDTO} from '../../models/attachment-dto';
import {SubAttachmentDTO} from '../../models/subAttachmentDTO';


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
    const safeIndex = ((this.currentIndexSignal() % len) + len) % len;
    return items[safeIndex];
  });

  readonly canNavigateSignal = computed(() => this.lengthSignal() > 1);


  prevSlide() {
    const len = this.lengthSignal();
    if (len <= 1) return;
    this.currentIndexSignal.update((index) => (index - 1 + len) % len);
  }

  nextSlide() {
    const len = this.lengthSignal();
    if (len <= 1) return;
    this.currentIndexSignal.update((index) => (index + 1) % len);
  }
}
