import {Component, effect, inject, input} from '@angular/core';

import {NgOptimizedImage} from '@angular/common';
import {MediaDTO} from '../../models/mediaDTO';


@Component({
  selector: 'app-media',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './media.html',
  styleUrl: './media.scss'
})
export class Media {
  mediaSignal = input.required<MediaDTO>({alias: 'media'});
  typeSignal = input.required<string>({alias: 'type'});
  prioritySignal = input<boolean>(false, {alias: 'priority'});

}
