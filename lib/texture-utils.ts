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
  
  if (width > height) {
    const newWidth = Math.min(nextPowerOf2(width), maxSize);
    const newHeight = Math.min(nextPowerOf2(newWidth / aspectRatio), maxSize);
    return { width: newWidth, height: newHeight };
  } else {
    const newHeight = Math.min(nextPowerOf2(height), maxSize);
    const newWidth = Math.min(nextPowerOf2(newHeight * aspectRatio), maxSize);
    return { width: newWidth, height: newHeight };
  }
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
  canvasHeight: number
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
        
        // Calculate optimal texture dimensions
        const { width: texWidth, height: texHeight } = calculateOptimalTextureDimensions(
          srcW,
          srcH
        );
        
        // Create high-res canvas for the texture
        const { canvas, ctx } = createHighResCanvas(texWidth, texHeight);
        
        // Draw the selected portion of the image
        ctx.drawImage(
          img,
          srcX, srcY, srcW, srcH,  // Source rectangle
          0, 0, texWidth, texHeight // Destination rectangle
        );
        
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