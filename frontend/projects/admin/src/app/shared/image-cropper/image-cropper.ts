import {Component, computed, effect, input, output, resource, signal, ChangeDetectionStrategy} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {ImageCropperView} from './image-cropper-view/image-cropper-view';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {ImageCropperPreview} from './image-cropper-preview/image-cropper-preview';
import {CropGeometry, generateCroppedBlob} from './utils/image-cropper-utils';

const DEFAULT_CROP_MASK_WIDTH = 400;
const DEFAULT_CROP_MASK_HEIGHT = 400;

/**
 * ImageCropper component provides a UI for selecting, dragging, and cropping an image.
 * It uses Angular Signals and Resources for reactive state management.
 */
@Component({
  selector: 'app-image-cropper',
  imports: [
    ImageCropperView,
    MatIcon,
    MatButton,
    ImageCropperPreview
  ],
  templateUrl: './image-cropper.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './image-cropper.scss',
})
export class ImageCropper {


  withPreviewInputSignal = input(false, {alias: 'withPreview'});

  /** Whether the cropping mask and result should be circular (forces 1:1 ratio). */
  isCircularInputSignal = input(false, {alias: 'isCircular'});

  /** The width of the cropping mask area. Defaults to 400. */
  cropMaskWidthInputSignal = input(DEFAULT_CROP_MASK_WIDTH, {
    alias: 'cropMaskWidth',
    transform: (value: number) => value || DEFAULT_CROP_MASK_WIDTH,
  });

  /** The height of the cropping mask area. Defaults to 400. Forced to match width if circular. */
  cropMaskHeightInputSignal = input(DEFAULT_CROP_MASK_HEIGHT, {
    alias: 'cropMaskHeight',
    transform: (value: number) => value || DEFAULT_CROP_MASK_HEIGHT,
  });

  /** Computed height that respects the circular constraint. */
  effectiveHeightSignal = computed(() => {
    return this.isCircularInputSignal() ? this.cropMaskWidthInputSignal() : this.cropMaskHeightInputSignal();
  });

  /** Emits the resulting Blob whenever the crop is updated. */
  croppedBlobChange = output<{
    error: Error | undefined;
    isLoading: boolean;
    value: Blob | undefined
  }>();


  /** Internal state for the selected image source URL. */
  private readonly _selectedImageUrlSignal = signal<string | null>(null);

  /** Internal state for the current crop geometry (coordinates and dimensions). */
  private readonly _currentCropGeometrySignal = signal<CropGeometry | null>(null);

  /**
   * Resource that asynchronously generates a cropped Blob
   * based on the selected image and current geometry.
   */
  protected readonly croppedBlobResource = this._initializeCroppedBlobResource();
  protected readonly croppedBlobStateSignal = computed(() => ({
    error: this.croppedBlobResource.error(),
    isLoading: this.croppedBlobResource.isLoading(),
    value: this.croppedBlobResource.value(),
  }));

  /** Accessor for the selected image URL (used in template). */
  protected get selectedImageUrlSignal() {
    return this._selectedImageUrlSignal;
  }

  constructor() {
    this._setupSourceUrlCleanup();

    // Émission du blob vers le parent via un observable pour garantir le déclenchement
    toObservable(this.croppedBlobStateSignal).subscribe(blobState => {
      this.croppedBlobChange.emit(blobState);
    });
  }

  /**
   * Handles image file selection from the file input.
   * Creates a local Object URL for the selected file.
   */
  onImageFileSelected(event: Event): void {
    const htmlInputElement = event.target as HTMLInputElement;
    const file = htmlInputElement.files?.[0];

    if (file) {
      const url = URL.createObjectURL(file);
      this._selectedImageUrlSignal.set(url);
    }
  }

  /**
   * Updates the internal crop geometry state.
   * @param geometry The new crop geometry coordinates.
   */
  updateCropGeometry(geometry: CropGeometry): void {
    this._currentCropGeometrySignal.set(geometry);
  }

  /**
   * Initializes the resource for generating the cropped blob.
   */
  private _initializeCroppedBlobResource() {
    return resource({
      params: () => ({
        source: this._selectedImageUrlSignal(),
        geometry: this._currentCropGeometrySignal(),
        isCircular: this.isCircularInputSignal()
      }),
      loader: async ({params}) => {
        if (!params.source || !params.geometry) {
          return undefined;
        }
        return await generateCroppedBlob(params.source, params.geometry, params.isCircular);
      }
    });
  }

  /**
   * Sets up an effect to automatically revoke the source image Object URL
   * whenever it changes or when the component is destroyed.
   */
  private _setupSourceUrlCleanup(): void {
    effect((onCleanup) => {
      const sourceUrl = this._selectedImageUrlSignal();
      onCleanup(() => {
        if (sourceUrl) {
          URL.revokeObjectURL(sourceUrl);
        }
      });
    });
  }

}
