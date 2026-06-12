// noinspection Annotator

import {Component, computed, effect, input, ChangeDetectionStrategy} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

/**
 * ImageCropperPreview component displays the resulting cropped image or current state (loading, error, empty).
 * It uses CSS variables via host binding to manage its dynamic dimensions.
 */
@Component({
  selector: 'app-image-cropper-preview',
  imports: [
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './image-cropper-preview.html',
  styleUrl: './image-cropper-preview.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[style.--target-width.px]': 'previewWidthInputSignal()',
    '[style.--target-height.px]': 'previewHeightInputSignal()',
  }
})
export class ImageCropperPreview {
  /** The required height for the preview display. */
  previewHeightInputSignal = input.required<number>({alias: 'previewHeight'});

  /** The required width for the preview display. */
  previewWidthInputSignal = input.required<number>({alias: 'previewWidth'});

  /** Indicates if the cropping process is currently active. */
  isLoadingInputSignal = input(false, {alias: 'isLoading'});

  /** Indicates if an error occurred during image processing. */
  isErrorInputSignal = input(false, {alias: 'isError'});

  /** The blob of the cropped image to preview. */
  previewBlobInputSignal = input.required<Blob | undefined>({alias: 'previewBlob'});

  /** The generated source URL for the preview image. */
  previewImageSourceSignal = computed(() => {
    const blob = this.previewBlobInputSignal();
    return blob ? URL.createObjectURL(blob) : null;
  });

  /** Whether the preview should be displayed as a circle. */
  isCircularInputSignal = input(false, {alias: 'isCircular'});

  constructor() {
    effect((onCleanup) => {
      const url = this.previewImageSourceSignal();
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }
}
