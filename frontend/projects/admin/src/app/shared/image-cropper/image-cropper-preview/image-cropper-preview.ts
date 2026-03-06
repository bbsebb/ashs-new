import {Component, input} from '@angular/core';
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
    '[style.--target-width.px]': 'previewWidthSignal()',
    '[style.--target-height.px]': 'previewHeightSignal()',
    '[style.--aspect-ratio]': 'previewWidthSignal() / previewHeightSignal()',
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

  /** The source URL of the cropped image to preview. */
  previewImageSourceSignal = input<string | null>(null);
}
