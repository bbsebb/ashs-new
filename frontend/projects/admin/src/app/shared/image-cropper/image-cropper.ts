import {Component, computed, effect, input, output, resource, Signal, signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {ImageCropperView} from './image-cropper-view/image-cropper-view';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {ImageCropperPreview} from './image-cropper-preview/image-cropper-preview';
import {CropGeometry, generateCroppedBlob} from './utils/image-cropper-utils';
import {Observable, of, switchMap} from 'rxjs';

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
  styleUrl: './image-cropper.scss',
})
export class ImageCropper {
  withPreviewSignal = input(true, {alias: 'withPreview'});

  /** Whether the cropping mask and result should be circular (forces 1:1 ratio). */
  isCircularSignal = input(false, {alias: 'isCircular'});

  /** The width of the cropping mask area. Defaults to 800. */
  cropMaskWidthSignal = input(100, {
    alias: 'cropMaskWidth',
    transform: (value: number) => value || 100,
  });

  /** The height of the cropping mask area. Defaults to 300. Forced to match width if circular. */
  cropMaskHeightSignal = input(100, {
    alias: 'cropMaskHeight',
    transform: (value: number) => value || 100,
  });

  /** Computed height that respects the circular constraint. */
  effectiveHeightSignal = computed(() => {
    return this.isCircularSignal() ? this.cropMaskWidthSignal() : this.cropMaskHeightSignal();
  });

  /** Emits the resulting Blob whenever the crop is updated. */
  croppedBlobChange = output<Blob | undefined>();

  /** Internal state for the selected image source URL. */
  private readonly _selectedImageUrlSignal = signal<string | null>(null);

  /** Internal state for the current crop geometry (coordinates and dimensions). */
  private readonly _currentCropGeometrySignal = signal<CropGeometry | null>(null);

  /**
   * Resource that asynchronously generates a cropped Blob
   * based on the selected image and current geometry.
   */
  protected readonly croppedBlobResource = this._initializeCroppedBlobResource();

  /**
   * Signal providing a temporary Object URL for previewing the cropped result.
   * Manages its own lifecycle (creation and revocation) to prevent memory leaks.
   */
  protected readonly previewImageUrlSignal = this._initializePreviewImageUrlSignal();

  /** Accessor for the selected image URL (used in template). */
  protected get selectedImageUrlSignal() {
    return this._selectedImageUrlSignal;
  }

  constructor() {
    this._setupSourceUrlCleanup();
    this._setupBlobEmission();
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
        isCircular: this.isCircularSignal()
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
   * Initializes the signal for the preview image URL with automatic cleanup.
   */
  private _initializePreviewImageUrlSignal(): Signal<string | null> {
    return toSignal(
      toObservable(this.croppedBlobResource.value).pipe(
        switchMap(blob => {
          if (!blob) {
            return of(null);
          }

          // On crée un nouvel Observable manuel au lieu de 'of'
          return new Observable<string>(observer => {
            const objectUrl = URL.createObjectURL(blob);
            observer.next(objectUrl);

            // Cette fonction de retour est appelée UNIQUEMENT au désabonnement
            // (quand switchMap reçoit un nouveau blob ou que le composant est détruit)
            return () => {
              URL.revokeObjectURL(objectUrl);
            };
          });
        })
      ),
      {initialValue: null}
    );
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

  /**
   * Sets up an effect to emit the generated blob to the parent component.
   */
  private _setupBlobEmission(): void {
    effect(() => {
      this.croppedBlobChange.emit(this.croppedBlobResource.value());
    });
  }

}
