import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

/**
 * Component for displaying an image preview with a fallback error UI.
 */
@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [NgOptimizedImage, MatIcon],
  templateUrl: './image-preview.html',
  styleUrl: './image-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreview {
  /** The full URL of the image to display. If null, error placeholder is shown. */
  imageUrlInputSignal = input<string | null>(null, {alias: 'imageUrl'});

  /** The image height in pixels. */
  heightInputSignal = input.required<number>({alias: 'height'});

  /** The image width in pixels. */
  widthInputSignal = input.required<number>({alias: 'width'});

  /** Alt text for the image. */
  altInputSignal = input<string>('image', {alias: 'alt'});

  /** Whether the image and placeholder should be circular. */
  isCircularInputSignal = input<boolean>(false, {alias: 'isCircular'});

  /** Label to display in the error placeholder. */
  errorLabelInputSignal = input<string>('Image manquante', {alias: 'errorLabel'});
}
