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
  currentIndex = signal(0);

  readonly length = computed(() => this.subAttachmentsSignal().length);

  readonly currentSubAttachment = computed(() => {
    const items = this.subAttachmentsSignal();
    const len = items.length;
    if (len === 0) return null;
    const safeIndex = ((this.currentIndex() % len) + len) % len;
    return items[safeIndex];
  });

  readonly canNavigate = computed(() => this.length() > 1);


  prevSlide() {
    const len = this.subAttachmentsSignal().length;
    if (len <= 1) return;
    this.currentIndex.update((index) => (index - 1 + len) % len);
  }

  nextSlide() {
    const len = this.subAttachmentsSignal().length;
    if (len <= 1) return;
    this.currentIndex.update((index) => (index + 1) % len);
  }
}
