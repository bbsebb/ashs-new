/**
 * @vitest-environment jsdom
 */
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {computeCropGeometry, CropGeometry, generateCroppedBlob} from './image-cropper-utils';

describe('ImageCropperUtils', () => {

  describe('computeCropGeometry', () => {
    it('should calculate correct geometry based on element bounds and natural dimensions', () => {
      // Mock for Image Element
      const mockImage = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 400,
          height: 300
        }),
        naturalWidth: 800,
        naturalHeight: 600
      } as unknown as HTMLImageElement;

      // Mock for Mask Element (the crop area)
      const mockMask = {
        getBoundingClientRect: () => ({
          left: 150,
          top: 150,
          width: 100,
          height: 100
        })
      } as unknown as HTMLElement;

      // Scale factors: 800/400 = 2, 600/300 = 2
      // Source X: (150 - 100) * 2 = 100
      // Source Y: (150 - 100) * 2 = 100
      // Source Width: 100 * 2 = 200
      // Source Height: 100 * 2 = 200

      const result = computeCropGeometry(mockImage, mockMask);

      expect(result).toEqual({
        sourceX: 100,
        sourceY: 100,
        sourceWidth: 200,
        sourceHeight: 200,
        destinationWidth: 100,
        destinationHeight: 100
      });
    });
  });

  describe('generateCroppedBlob', () => {
    const mockGeometry: CropGeometry = {
      sourceX: 10,
      sourceY: 10,
      sourceWidth: 100,
      sourceHeight: 100,
      destinationWidth: 50,
      destinationHeight: 50
    };

    beforeEach(() => {
      vi.restoreAllMocks();

      // Mock global Image constructor
      globalThis.Image = class {
        onload: () => void = () => {
        };
        onerror: () => void = () => {
        };
        src: string = '';
        crossOrigin: string = '';

        constructor() {
          setTimeout(() => this.onload(), 0);
        }
      } as any;

      // Mock Canvas and Context
      const mockContext = {
        drawImage: vi.fn(),
      };

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
        toBlob: vi.fn((callback) => callback(new Blob(['mock-data'], {type: 'image/webp'}))),
        width: 0,
        height: 0
      };

      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas as any;
        return {} as any;
      });
    });

    it('should draw the image with correct geometry and return a blob', async () => {
      const blob = await generateCroppedBlob('mock-url', mockGeometry);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      expect(canvas.width).toBe(mockGeometry.destinationWidth);
      expect(canvas.height).toBe(mockGeometry.destinationHeight);

      expect(context?.drawImage).toHaveBeenCalledWith(
        expect.any(Object),
        mockGeometry.sourceX,
        mockGeometry.sourceY,
        mockGeometry.sourceWidth,
        mockGeometry.sourceHeight,
        0,
        0,
        mockGeometry.destinationWidth,
        mockGeometry.destinationHeight
      );

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/webp');
    });

    it('should throw error if canvas context cannot be created', async () => {
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return {getContext: () => null} as any;
        return {} as any;
      });

      expect(generateCroppedBlob('mock-url', mockGeometry))
        .rejects.toThrow('Could not create 2D context for the canvas.');
    });

    it('should throw error if image loading fails', async () => {
      globalThis.Image = class {
        onerror: () => void = () => {
        };

        set src(_: string) {
          setTimeout(() => this.onerror(), 0);
        }
      } as any;

      expect(generateCroppedBlob('bad-url', mockGeometry))
        .rejects.toThrow('Failed to load image from source: bad-url');
    });
  });
});
