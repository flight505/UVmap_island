import { Selection } from './types';

export const MAX_TEXTURE_SIZE = 4096;

/**
 * Get the next power of 2 for a given number
 */
export function nextPowerOf2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calculate optimal texture dimensions maintaining aspect ratio
 */
export function calculateOptimalTextureDimensions(
  width: number,
  height: number,
  maxSize: number = MAX_TEXTURE_SIZE
): { width: number; height: number } {
  const aspectRatio = width / height;
  
  // Simply ensure dimensions don't exceed maxSize while maintaining aspect ratio
  // Don't force power-of-2 dimensions as this distorts the aspect ratio
  if (width > maxSize || height > maxSize) {
    if (width > height) {
      const newWidth = maxSize;
      const newHeight = Math.round(maxSize / aspectRatio);
      return { width: newWidth, height: newHeight };
    } else {
      const newHeight = maxSize;
      const newWidth = Math.round(maxSize * aspectRatio);
      return { width: newWidth, height: newHeight };
    }
  }
  
  // Return exact dimensions to maintain perfect aspect ratio
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Create a high-resolution canvas with proper DPI scaling
 */
export function createHighResCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; scale: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true,
    willReadFrequently: false,
  });
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }
  
  const dpr = window.devicePixelRatio || 1;
  
  // Set actual dimensions
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Scale canvas back down using CSS
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Scale drawing context to match device pixel ratio
  ctx.scale(dpr, dpr);
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  return { canvas, ctx, scale: dpr };
}

/**
 * Extract texture from image based on selection
 */
export async function extractTextureFromSelection(
  imageUrl: string,
  selection: Selection,
  canvasWidth: number,
  canvasHeight: number,
  surface?: 'top' | 'left' | 'right'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calculate the actual selection coordinates in the original image
        const scaleX = img.width / canvasWidth;
        const scaleY = img.height / canvasHeight;
        
        const srcX = selection.x * scaleX;
        const srcY = selection.y * scaleY;
        const srcW = selection.width * scaleX;
        const srcH = selection.height * scaleY;
        
        // Get transformation settings
        const rotation = selection.rotation || 0;
        const flipH = selection.flipH || false;
        const flipV = selection.flipV || false;
        
        // When rotated 90 or 270, the output dimensions need to swap
        // to maintain the correct aspect ratio for the 3D face
        const isRotated90or270 = rotation === 90 || rotation === 270;
        
        // Calculate final texture dimensions
        // If rotated 90/270, swap dimensions so output matches expected face aspect ratio
        const finalWidth = isRotated90or270 ? srcH : srcW;
        const finalHeight = isRotated90or270 ? srcW : srcH;
        
        const { width: texWidth, height: texHeight } = calculateOptimalTextureDimensions(
          finalWidth,
          finalHeight
        );
        
        // Create canvas with the correct output dimensions
        const { canvas, ctx } = createHighResCanvas(texWidth, texHeight);
        
        // Set up transformations
        ctx.save();
        
        // Clear canvas and set background
        ctx.clearRect(0, 0, texWidth, texHeight);
        
        // Move to center for transformations
        ctx.translate(texWidth / 2, texHeight / 2);
        
        // Apply rotation
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        
        // Apply flips
        if (flipH) ctx.scale(-1, 1);
        if (flipV) ctx.scale(1, -1);
        
        // Move back, accounting for dimension changes
        if (isRotated90or270) {
          // When rotated, we need to draw at swapped dimensions
          ctx.translate(-texHeight / 2, -texWidth / 2);
          // Draw with swapped destination dimensions
          ctx.drawImage(
            img,
            srcX, srcY, srcW, srcH,  // Source rectangle
            0, 0, texHeight, texWidth // Destination - swapped for rotation
          );
        } else {
          ctx.translate(-texWidth / 2, -texHeight / 2);
          // Draw normally
          ctx.drawImage(
            img,
            srcX, srcY, srcW, srcH,  // Source rectangle
            0, 0, texWidth, texHeight // Destination rectangle
          );
        }
        
        ctx.restore();
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Generate UV coordinates from selection
 */
export function generateUVCoordinates(
  selection: Selection,
  imageWidth: number,
  imageHeight: number
): [number, number, number, number] {
  const u1 = selection.x / imageWidth;
  const v1 = selection.y / imageHeight;
  const u2 = (selection.x + selection.width) / imageWidth;
  const v2 = (selection.y + selection.height) / imageHeight;
  
  return [u1, v1, u2, v2];
}

/**
 * Load image and return dimensions
 */
export function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Apply perspective correction to image (simplified version)
 * In production, you'd want to use a more sophisticated algorithm
 */
export function applyPerspectiveCorrection(
  imageData: ImageData,
  corners: { tl: [number, number]; tr: [number, number]; bl: [number, number]; br: [number, number] }
): ImageData {
  // This is a placeholder for perspective correction
  // In a real implementation, you'd use a perspective transform matrix
  console.log('Perspective correction not yet implemented', corners);
  return imageData;
}

/**
 * Enhance stone patterns for better visibility
 */
export function enhanceStonePattern(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Apply slight sharpening and contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    // Increase contrast
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const avg = (r + g + b) / 3;
    const factor = 1.2; // Contrast factor
    
    data[i] = Math.min(255, avg + (r - avg) * factor);
    data[i + 1] = Math.min(255, avg + (g - avg) * factor);
    data[i + 2] = Math.min(255, avg + (b - avg) * factor);
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Check if image needs resizing for performance
 */
export function shouldResizeImage(width: number, height: number, maxSize: number = 8192): boolean {
  return width > maxSize || height > maxSize;
}

/**
 * Resize image maintaining aspect ratio
 */
export async function resizeImage(
  imageUrl: string,
  maxSize: number = 8192
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (!shouldResizeImage(img.width, img.height, maxSize)) {
        resolve(imageUrl);
        return;
      }
      
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;
      
      if (img.width > img.height) {
        newWidth = maxSize;
        newHeight = maxSize / aspectRatio;
      } else {
        newHeight = maxSize;
        newWidth = maxSize * aspectRatio;
      }
      
      const { canvas, ctx } = createHighResCanvas(newWidth, newHeight);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
}