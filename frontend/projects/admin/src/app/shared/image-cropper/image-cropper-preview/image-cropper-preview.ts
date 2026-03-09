import {Component, computed, effect, input} from '@angular/core';
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
  host: {
    '[style.--target-width.px]': 'calculatedWithSignal()',
    '[style.--target-height.px]': 'calculatedHeightSignal()',
    '[style.--aspect-ratio]': 'calculatedWithSignal() / calculatedHeightSignal()',
  }
})
export class ImageCropperPreview {
  /** The required height for the preview display. */
  previewHeightSignal = input.required<number>();

  /** The required width for the preview display. */
  previewWidthSignal = input.required<number>();

  /** Indicates if the cropping process is currently active. */
  isLoadingSignal = input(false);

  /** Indicates if an error occurred during image processing. */
  isErrorSignal = input(false);

  /** The blob of the cropped image to preview. */
  previewBlobSignal = input.required<Blob | undefined>({alias: 'previewBlob'});

  /** The generated source URL for the preview image. */
  previewImageSourceSignal = computed(() => {
    const blob = this.previewBlobSignal();
    return blob ? URL.createObjectURL(blob) : null;
  });

  /** Whether the preview should be displayed as a circle. */
  isCircularSignal = input(false);

  calculatedWithSignal = computed(() => {
    if (this.isErrorSignal() || this.isLoadingSignal() || !this.previewImageSourceSignal()) {
      return 300;
    } else {
      return this.previewWidthSignal();
    }
  });

  calculatedHeightSignal = computed(() => {
    if (this.isErrorSignal() || this.isLoadingSignal() || !this.previewImageSourceSignal()) {
      return 300;
    } else {
      return this.previewHeightSignal();
    }
  });

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
