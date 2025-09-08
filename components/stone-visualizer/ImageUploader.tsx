'use client';

import { useCallback, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { resizeImage, shouldResizeImage } from '@/lib/texture-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    size: string;
    dimensions: string;
  } | null>(null);
  
  const { loadedImage, setLoadedImage } = useStore();
  
  // Load default image from public/ if present
  // This attempts to load "/L25155.jpg" once on mount when no image is loaded
  // and silently does nothing if the file is missing.
  useEffect(() => {
    if (loadedImage) return;
    const defaultUrl = '/L25155.jpg';
    const img = new Image();
    img.onload = () => {
      setLoadedImage(defaultUrl);
      setImageInfo({
        name: 'L25155.jpg',
        size: 'static asset',
        dimensions: `${img.width} × ${img.height}px`,
      });
    };
    img.onerror = () => {/* ignore if not present */};
    img.src = defaultUrl;
  }, [loadedImage, setLoadedImage]);

  // If a default image is already set (e.g., from the store), populate the UI card info
  useEffect(() => {
    if (!loadedImage || imageInfo) return;
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: loadedImage.split('/').pop() || 'image',
        size: 'static asset',
        dimensions: `${img.width} × ${img.height}px`,
      });
    };
    img.onerror = () => {/* ignore */};
    img.src = loadedImage;
  }, [loadedImage, imageInfo]);
  
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      setIsLoading(false);
      return;
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image size must be less than 50MB');
      setIsLoading(false);
      return;
    }
    
    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // Load image to get dimensions
        const img = new Image();
        img.onload = async () => {
          // Check if image needs resizing
          let finalImageUrl = dataUrl;
          if (shouldResizeImage(img.width, img.height)) {
            console.log('Resizing large image for performance...');
            finalImageUrl = await resizeImage(dataUrl);
          }
          
          // Update image info
          setImageInfo({
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            dimensions: `${img.width} × ${img.height}px`,
          });
          
          // Set loaded image in store
          setLoadedImage(finalImageUrl);
          setIsLoading(false);
        };
        
        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };
        
        img.src = dataUrl;
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError('An error occurred while loading the image');
      setIsLoading(false);
      console.error(err);
    }
  }, [setLoadedImage]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );
  
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );
  
  const clearImage = useCallback(() => {
    setLoadedImage(null);
    setImageInfo(null);
    setError(null);
  }, [setLoadedImage]);
  
  if (loadedImage && imageInfo) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={loadedImage} 
                alt="Loaded stone slab"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Stone Slab Loaded</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{imageInfo.name}</div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{imageInfo.dimensions}</Badge>
                  <Badge variant="secondary">{imageInfo.size}</Badge>
                </div>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearImage}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      className={`
        relative overflow-hidden transition-all
        ${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${error ? 'border-destructive' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-8">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isLoading}
        />
        
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="mb-4">
            {isLoading ? (
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            ) : error ? (
              <AlertCircle className="h-12 w-12 text-destructive" />
            ) : (
              <div className="relative">
                <Upload className="h-12 w-12 text-muted-foreground" />
                {isDragging && (
                  <div className="absolute inset-0 animate-ping">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading image...</p>
            ) : error ? (
              <>
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to try again</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drop your stone slab image here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </>
            )}
          </div>
        </label>
        
        {!isLoading && !error && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>Supports JPG, PNG, WebP up to 50MB</span>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              For best results, use perspective-corrected images
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
