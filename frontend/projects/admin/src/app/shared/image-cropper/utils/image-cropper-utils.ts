/**
 * Defines the complete geometry of the area to be cropped.
 * Uses explicit names to avoid confusion between source image coordinates
 * and destination canvas coordinates.
 */
export interface CropGeometry {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destinationWidth: number;
  destinationHeight: number;
}

/**
 * Calculates the crop coordinates based on the image and mask elements.
 *
 * @param imageElement The HTML image element being cropped.
 * @param maskElement The HTML element representing the crop area (the mask).
 * @param targetWidth The desired output width in pixels.
 * @param targetHeight The desired output height in pixels.
 * @returns The calculated crop geometry.
 */
export function computeCropGeometry(
  imageElement: HTMLImageElement,
  maskElement: HTMLElement,
  targetWidth: number,
  targetHeight: number
): CropGeometry {
  const imageBoundingClientRect = imageElement.getBoundingClientRect();
  const maskBoundingClientRect = maskElement.getBoundingClientRect();

  // Scale factor (Real size / Displayed size on screen)
  const horizontalScaleRatio = imageElement.naturalWidth / imageBoundingClientRect.width;
  const verticalScaleRatio = imageElement.naturalHeight / imageBoundingClientRect.height;

  return {
    sourceX: (maskBoundingClientRect.left - imageBoundingClientRect.left) * horizontalScaleRatio,
    sourceY: (maskBoundingClientRect.top - imageBoundingClientRect.top) * verticalScaleRatio,
    sourceWidth: maskBoundingClientRect.width * horizontalScaleRatio,
    sourceHeight: maskBoundingClientRect.height * verticalScaleRatio,
    destinationWidth: targetWidth,
    destinationHeight: targetHeight
  };
}

/**
 * Converts a Canvas element to a Blob using a Promise-based approach.
 *
 * @param canvas The canvas element to convert.
 * @param imageMediaType The media type of the resulting image (default: 'image/webp').
 * @param quality The quality of the resulting image (0 to 1).
 * @returns A promise that resolves to the image Blob.
 */
async function convertCanvasToBlob(
  canvas: HTMLCanvasElement,
  imageMediaType = 'image/png',
  quality = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error('The conversion from Canvas to Blob failed.'));
        } else {
          resolve(blob);
        }
      },
      imageMediaType,
      quality
    );
  });
}

/**
 * Generates a cropped Blob from the image source and calculated geometry.
 *
 * @param imageSource The source URL or base64 string of the image.
 * @param geometry The geometry defining the crop area.
 * @param isCircular Whether the final crop should be clipped into a circle.
 * @param imageMediaType The media type of the resulting image (default: 'image/webp').
 * @param quality The quality of the resulting image (0 to 1).
 * @returns A promise that resolves to the cropped image Blob.
 */
export async function generateCroppedBlob(
  imageSource: string,
  geometry: CropGeometry,
  isCircular = false,
  imageMediaType = 'image/png',
  quality = 1
): Promise<Blob> {
  const imageElement = await loadImageElement(imageSource);
  const canvas = document.createElement('canvas');

  // Configure the output canvas size
  canvas.width = geometry.destinationWidth;
  canvas.height = geometry.destinationHeight;

  const canvasRenderingContext = canvas.getContext('2d');
  if (canvasRenderingContext === null) {
    throw new Error('Could not create 2D context for the canvas.');
  }

  // Apply circular clipping if requested
  if (isCircular) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;

    canvasRenderingContext.beginPath();
    canvasRenderingContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
    canvasRenderingContext.clip();
  }

  // Draw the cropped portion of the image onto the canvas
  canvasRenderingContext.drawImage(
    imageElement,
    geometry.sourceX,
    geometry.sourceY,
    geometry.sourceWidth,
    geometry.sourceHeight,
    0, // Destination X (always 0 for the result)
    0, // Destination Y (always 0 for the result)
    geometry.destinationWidth,
    geometry.destinationHeight
  );

  return convertCanvasToBlob(canvas, imageMediaType, quality);
}

/**
 * Utility to load an image from a source URL and return it as an HTMLImageElement.
 *
 * @param imageSource The source URL of the image.
 * @returns A promise that resolves to the loaded HTMLImageElement.
 */
function loadImageElement(imageSource: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageElement = new Image();
    // Enable cross-origin to avoid canvas security errors (tainted canvas)
    imageElement.crossOrigin = 'anonymous';
    imageElement.src = imageSource;
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = () => reject(new Error(`Failed to load image from source: ${imageSource}`));
  });
}


