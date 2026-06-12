/**
 * Optimized media handler for images and videos with priority loading support.
 */
import {Component, input, ChangeDetectionStrategy} from '@angular/core';

import {NgOptimizedImage} from '@angular/common';
import {MediaDTO} from '../../models/meta.dtos';


@Component({
  selector: 'app-media',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './media.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './media.scss'
})
export class Media {
  mediaInputSignal = input.required<MediaDTO>({alias: 'media'});
  typeInputSignal = input.required<string>({alias: 'type'});
  priorityInputSignal = input<boolean>(false, {alias: 'priority'});

}
