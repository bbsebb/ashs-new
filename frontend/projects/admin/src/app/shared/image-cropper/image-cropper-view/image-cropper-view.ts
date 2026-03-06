import {Component, effect, ElementRef, input, output, signal, viewChild} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {computeCropGeometry, CropGeometry} from '../utils/image-cropper-utils';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {PercentPipe} from '@angular/common';

/**
 * ImageCropperView component provides the interactive editing area.
 * It allows the user to drag and zoom the image behind a fixed crop mask.
 */
@Component({
  selector: 'app-image-cropper-view',
  imports: [
    CdkDrag,
    MatIcon,
    MatIconButton,
    PercentPipe
  ],
  templateUrl: './image-cropper-view.html',
  styleUrl: './image-cropper-view.scss',
  host: {
    '[style.--target-width.px]': 'cropMaskWidthSignal()',
    '[style.--target-height.px]': 'cropMaskHeightSignal()',
    '[style.--aspect-ratio]': 'cropMaskWidthSignal() / cropMaskHeightSignal()',
  }
})
export class ImageCropperView {
  /** The source URL of the image to be edited. */
  selectedImageSourceSignal = input.required<string | null>();

  /** The width of the cropping mask area. */
  cropMaskWidthSignal = input.required<number>();

  /** The height of the cropping mask area. */
  cropMaskHeightSignal = input.required<number>();

  /** Emits the new crop geometry coordinates whenever the image is moved, zoomed or loaded. */
  cropGeometryChange = output<CropGeometry>();

  /** Reference to the draggable image element. */
  private readonly _imageElementRef = viewChild.required<ElementRef<HTMLImageElement>>('imageElement');

  /** Reference to the static mask overlay element. */
  private readonly _maskElementRef = viewChild.required<ElementRef<HTMLDivElement>>('maskElement');

  /** Internal state for the zoom level. 1.0 is original size. */
  protected readonly zoomLevelSignal = signal(1);

  /** Minimum allowed zoom level. */
  private readonly _MIN_ZOOM = 0.5;

  /** Maximum allowed zoom level. */
  private readonly _MAX_ZOOM = 5.0;

  /** Zoom step for each button click. */
  private readonly _ZOOM_STEP = 0.1;

  constructor() {
    /** Automatically recalculate geometry when zoom changes. */
    effect(() => {
      // We access the signal to subscribe to changes.
      this.zoomLevelSignal();
      // Wait for the next macro-task to ensure CSS transform is applied before measuring.
      setTimeout(() => this.recalculateCropGeometry());
    });
  }

  /**
   * Increases the zoom level within maximum limits.
   */
  zoomIn(): void {
    this.zoomLevelSignal.update(current =>
      Math.min(current + this._ZOOM_STEP, this._MAX_ZOOM)
    );
  }

  /**
   * Decreases the zoom level within minimum limits.
   */
  zoomOut(): void {
    this.zoomLevelSignal.update(current =>
      Math.max(current - this._ZOOM_STEP, this._MIN_ZOOM)
    );
  }

  /**
   * Resets the zoom and position.
   */
  resetView(): void {
    this.zoomLevelSignal.set(1);
  }

  /**
   * Handles mouse wheel events to zoom in or out.
   * @param event The wheel event from the mouse.
   */
  onWheel(event: WheelEvent): void {
    // Only zoom if an image is loaded
    if (!this.selectedImageSourceSignal()) {
      return;
    }

    // Prevent page scrolling while zooming inside the editor
    event.preventDefault();

    const zoomDirection = event.deltaY < 0 ? 1 : -1;
    const wheelZoomStep = 0.05; // Slightly finer step for mouse wheel

    this.zoomLevelSignal.update(current => {
      const nextZoom = current + (zoomDirection * wheelZoomStep);
      return Math.min(Math.max(nextZoom, this._MIN_ZOOM), this._MAX_ZOOM);
    });
  }

  /**
   * Calculates the crop geometry based on the current positions and scale of the image.
   * Emits the results to the parent component.
   */
  recalculateCropGeometry(): void {
    const imageElement = this._imageElementRef().nativeElement;
    const maskElement = this._maskElementRef().nativeElement;

    // Safety check: image must be fully loaded to get correct natural dimensions.
    if (!imageElement.complete || imageElement.naturalWidth === 0) {
      return;
    }

    const geometry = computeCropGeometry(
      imageElement,
      maskElement,
      this.cropMaskWidthSignal(),
      this.cropMaskHeightSignal()
    );
    this.cropGeometryChange.emit(geometry);
  }
}
