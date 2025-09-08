'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { extractTextureFromSelection } from '@/lib/texture-utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Move, 
  Grid3x3, 
  Maximize2,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Info,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const MIN_CANVAS_WIDTH = 1600;
const MIN_CANVAS_HEIGHT = 1200;

interface SelectionBox {
  surface: 'top' | 'left' | 'right';
  color: string;
  label: string;
}

const SELECTION_BOXES: SelectionBox[] = [
  { surface: 'top', color: '#FF6B6B', label: 'Top Plate' },
  { surface: 'left', color: '#4ECDC4', label: 'Left Side' },
  { surface: 'right', color: '#45B7D1', label: 'Right Side' },
];

export default function TextureSelector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cachedImageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showAlignment, setShowAlignment] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: MIN_CANVAS_WIDTH, height: MIN_CANVAS_HEIGHT });
  const [selectedSurface, setSelectedSurface] = useState<'top' | 'left' | 'right' | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [baseCanvasSize, setBaseCanvasSize] = useState({ width: MIN_CANVAS_WIDTH, height: MIN_CANVAS_HEIGHT });
  
  const {
    loadedImage,
    selectorOpen,
    setSelectorOpen,
    selectorPan,
    setSelectorPan,
    selections,
    updateSelection,
    islandDimensions,
    slabDimensions,
    setSlabDimensions,
  } = useStore();
  
  // Function to rotate a selection
  const rotateSelection = (surface: 'top' | 'left' | 'right', direction: 'cw' | 'ccw') => {
    const selection = selections[surface];
    const currentRotation = selection.rotation || 0;
    const newRotation = direction === 'cw' 
      ? (currentRotation + 90) % 360
      : (currentRotation - 90 + 360) % 360;
    
    updateSelection(surface, {
      ...selection,
      rotation: newRotation,
    });
  };

  // Function to flip a selection
  const flipSelection = (surface: 'top' | 'left' | 'right', direction: 'horizontal' | 'vertical') => {
    const selection = selections[surface];
    
    if (direction === 'horizontal') {
      updateSelection(surface, {
        ...selection,
        flipH: !selection.flipH,
      });
    } else {
      updateSelection(surface, {
        ...selection,
        flipV: !selection.flipV,
      });
    }
  };

  // Cache the image and calculate proper canvas size with consistent scaling
  useEffect(() => {
    if (!loadedImage) {
      cachedImageRef.current = null;
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      cachedImageRef.current = img;
      
      // CRITICAL: Use a consistent scale where canvas pixels = mm
      // We'll use a base scale of 0.3 pixels per mm (adjustable with zoom)
      const BASE_PIXELS_PER_MM = 0.3;
      
      // Calculate canvas size based on slab dimensions in mm
      const baseWidth = slabDimensions.width * BASE_PIXELS_PER_MM;
      const baseHeight = slabDimensions.height * BASE_PIXELS_PER_MM;
      
      // Check if this fits in viewport, if not, reduce the scale
      const maxWidth = window.innerWidth * 0.94;
      const maxHeight = window.innerHeight * 0.55;
      
      let scale = BASE_PIXELS_PER_MM;
      if (baseWidth > maxWidth) {
        scale = maxWidth / slabDimensions.width;
      }
      if (baseHeight * (scale / BASE_PIXELS_PER_MM) > maxHeight) {
        scale = maxHeight / slabDimensions.height;
      }
      
      const finalBaseWidth = slabDimensions.width * scale;
      const finalBaseHeight = slabDimensions.height * scale;
      
      setBaseCanvasSize({ width: finalBaseWidth, height: finalBaseHeight });
      setCanvasSize({ 
        width: finalBaseWidth * imageZoom, 
        height: finalBaseHeight * imageZoom 
      });
    };
    img.src = loadedImage;
  }, [loadedImage, slabDimensions]);

  // Update canvas size when zoom changes
  useEffect(() => {
    setCanvasSize({
      width: baseCanvasSize.width * imageZoom,
      height: baseCanvasSize.height * imageZoom
    });
  }, [imageZoom, baseCanvasSize]);

  // Update selection sizes based on physical dimensions
  useEffect(() => {
    if (!cachedImageRef.current || canvasSize.width === 0) return;
    
    // The key is to understand the scaling:
    // 1. The actual image has pixel dimensions (e.g., 6400×1352)
    // 2. The slab has physical dimensions in mm (e.g., 9060×2020)
    // 3. The canvas displays the image at a certain size
    
    // Calculate the scale factor from physical mm to canvas pixels
    // This accounts for the image being displayed at canvas size
    // and representing the physical slab dimensions
    const mmToCanvasScale = canvasSize.width / slabDimensions.width;
    
    // Update selection sizes to represent actual physical dimensions
    // Top surface: length × width of island
    const topWidth = islandDimensions.length * mmToCanvasScale;
    const topHeight = islandDimensions.width * mmToCanvasScale;
    
    // Side surfaces: width × height of island  
    const sideWidth = islandDimensions.width * mmToCanvasScale;
    const sideHeight = islandDimensions.height * mmToCanvasScale;
    
    updateSelection('top', {
      ...selections.top,
      width: topWidth,
      height: topHeight,
    });
    
    updateSelection('left', {
      ...selections.left,
      width: sideWidth,
      height: sideHeight,
    });
    
    updateSelection('right', {
      ...selections.right,
      width: sideWidth,
      height: sideHeight,
    });
  }, [canvasSize, slabDimensions, islandDimensions]);
  
  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const cachedImage = cachedImageRef.current;
    if (!canvas || !cachedImage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size with high DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    ctx.save();
    
    // Apply pan transformation
    ctx.translate(selectorPan.x, selectorPan.y);
    
    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cached image
    ctx.drawImage(cachedImage, 0, 0, canvasSize.width, canvasSize.height);
    
    // Draw grid overlay if enabled
    if (showGrid) {
      drawGrid(ctx, canvasSize.width, canvasSize.height);
    }
    
    // Draw selection boxes
    SELECTION_BOXES.forEach(box => {
      drawSelectionBox(ctx, box, selections[box.surface]);
    });
    
    // Draw alignment guides if enabled
    if (showAlignment) {
      drawAlignmentGuides(ctx);
    }
    
    ctx.restore();
    
    // Draw scale ruler (outside of pan transformation)
    drawScaleRuler(ctx, canvasSize.width, canvasSize.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, selectorPan, selections, showGrid, showAlignment]);
  
  // Draw scale ruler
  const drawScaleRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const BASE_PIXELS_PER_MM = 0.3;
    const rulerHeight = 30;
    const rulerWidth = 200;
    const margin = 20;
    
    // Position at bottom-left corner
    const x = margin;
    const y = height - margin - rulerHeight;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, rulerWidth, rulerHeight);
    
    // Calculate scale
    const mmRepresented = rulerWidth / BASE_PIXELS_PER_MM;
    let scaleUnit = 1000; // 1000mm = 1m
    let scaleText = '1 meter';
    
    if (mmRepresented < 500) {
      scaleUnit = 100;
      scaleText = '100mm';
    } else if (mmRepresented < 1000) {
      scaleUnit = 500;
      scaleText = '500mm';
    }
    
    const scalePixels = scaleUnit * BASE_PIXELS_PER_MM;
    
    // Draw scale bar
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 20);
    ctx.lineTo(x + 10 + scalePixels, y + 20);
    ctx.stroke();
    
    // Draw end caps
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 15);
    ctx.lineTo(x + 10, y + 25);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + 10 + scalePixels, y + 15);
    ctx.lineTo(x + 10 + scalePixels, y + 25);
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(scaleText, x + 10 + scalePixels/2, y + 5);
    
    // Show current scale info in top-right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 180, margin, 160, 25);
    ctx.fillStyle = 'white';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Scale: 1mm = ${BASE_PIXELS_PER_MM}px`, width - 175, margin + 15);
  };
  
  // Draw grid overlay
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const gridSize = 50;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };
  
  // Draw selection box
  const drawSelectionBox = (
    ctx: CanvasRenderingContext2D,
    box: SelectionBox,
    selection: typeof selections.top
  ) => {
    const centerX = selection.x + selection.width / 2;
    const centerY = selection.y + selection.height / 2;
    const rotation = selection.rotation || 0;
    
    // Draw the rotated and flipped selection
    ctx.save();
    
    // Apply transformations around center
    ctx.translate(centerX, centerY);
    
    // Apply flips
    const flipH = selection.flipH || false;
    const flipV = selection.flipV || false;
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
    
    // Draw the main selection rectangle
    ctx.strokeStyle = box.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = box.color + '33'; // 20% opacity
    
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    
    // Draw corner indicators to show orientation
    ctx.fillStyle = box.color;
    ctx.fillRect(selection.x, selection.y, 10, 10); // Top-left corner indicator
    
    ctx.restore();
    
    // Draw UI elements without rotation
    ctx.save();
    
    // Draw label at center
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.strokeText(box.label, centerX, centerY);
    ctx.fillText(box.label, centerX, centerY);
    
    // Draw transformation indicators
    const transforms = [];
    if (rotation !== 0) transforms.push(`${rotation}°`);
    if (selection.flipH) transforms.push('↔');
    if (selection.flipV) transforms.push('↕');
    
    if (transforms.length > 0) {
      ctx.fillStyle = box.color;
      ctx.font = 'bold 14px Arial';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      const transformText = transforms.join(' ');
      ctx.strokeText(transformText, centerX, centerY + 20);
      ctx.fillText(transformText, centerX, centerY + 20);
    }
    
    // Draw actual island surface dimensions
    ctx.font = '12px Arial';
    ctx.fillStyle = box.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    let surfaceText = '';
    if (box.surface === 'top') {
      surfaceText = `${islandDimensions.length}×${islandDimensions.width}mm`;
    } else {
      surfaceText = `${islandDimensions.width}×${islandDimensions.height}mm`;
    }
    ctx.strokeText(surfaceText, centerX, centerY - 20);
    ctx.fillText(surfaceText, centerX, centerY - 20);
    
    // Highlight if selected with a border around the rotated shape
    if (selectedSurface === box.surface) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(selection.x - 3, selection.y - 3, selection.width + 6, selection.height + 6);
      ctx.setLineDash([]);
      
      ctx.restore();
    }
    
    ctx.restore();
  };
  
  // Draw alignment guides between selections
  const drawAlignmentGuides = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5]);
    
    // Check if top and left align
    const topRight = selections.top.x + selections.top.width;
    const leftLeft = selections.left.x;
    
    if (Math.abs(topRight - leftLeft) < 10) {
      ctx.beginPath();
      ctx.moveTo(topRight, 0);
      ctx.lineTo(topRight, canvasSize.height);
      ctx.stroke();
    }
    
    // Check if top and right align
    const rightLeft = selections.right.x;
    
    if (Math.abs(topRight - rightLeft) < 10) {
      ctx.beginPath();
      ctx.moveTo(topRight, 0);
      ctx.lineTo(topRight, canvasSize.height);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };
  
  // Helper function to check if point is inside rotated rectangle
  const isPointInRotatedRect = (
    px: number, 
    py: number, 
    selection: typeof selections.top
  ): boolean => {
    const centerX = selection.x + selection.width / 2;
    const centerY = selection.y + selection.height / 2;
    const rotation = (selection.rotation || 0) * Math.PI / 180;
    
    // Translate point to origin (relative to rectangle center)
    const translatedX = px - centerX;
    const translatedY = py - centerY;
    
    // Rotate point back (inverse rotation)
    const rotatedX = translatedX * Math.cos(-rotation) - translatedY * Math.sin(-rotation);
    const rotatedY = translatedX * Math.sin(-rotation) + translatedY * Math.cos(-rotation);
    
    // Check if point is inside the unrotated rectangle
    const halfWidth = selection.width / 2;
    const halfHeight = selection.height / 2;
    
    return Math.abs(rotatedX) <= halfWidth && Math.abs(rotatedY) <= halfHeight;
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left - selectorPan.x;
    const y = e.clientY - rect.top - selectorPan.y;
    
    // Check if clicking on a selection box (accounting for rotation)
    for (const box of SELECTION_BOXES) {
      const selection = selections[box.surface];
      if (isPointInRotatedRect(x, y, selection)) {
        setIsDragging(box.surface);
        setSelectedSurface(box.surface);
        setDragOffset({ x: x - selection.x, y: y - selection.y });
        return;
      }
    }
    
    // Otherwise start panning
    setIsPanning(true);
    setPanStart({ x: e.clientX - selectorPan.x, y: e.clientY - selectorPan.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left - selectorPan.x;
      const y = e.clientY - rect.top - selectorPan.y;
      
      const selection = selections[isDragging as keyof typeof selections];
      const newX = Math.max(0, Math.min(canvasSize.width - selection.width, x - dragOffset.x));
      const newY = Math.max(0, Math.min(canvasSize.height - selection.height, y - dragOffset.y));
      
      updateSelection(isDragging as 'top' | 'left' | 'right', {
        ...selection,
        x: newX,
        y: newY,
      });
    } else if (isPanning) {
      setSelectorPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(null);
    setIsPanning(false);
  };
  
  // Apply textures to 3D model
  const handleApplyTextures = async () => {
    if (!loadedImage || !cachedImageRef.current) return;
    
    // Generate texture URLs for each surface
    const promises = SELECTION_BOXES.map(async (box) => {
      // Need to convert from canvas coordinates to image coordinates
      // The canvas might be zoomed, but selections are in canvas coordinates
      const selection = selections[box.surface];
      
      // Create a selection in image coordinates
      const imageSelection = {
        ...selection,
        // No need to adjust for zoom since canvasSize already includes zoom
        // The extraction function will scale based on canvasSize vs image size
      };
      
      // Pass the target surface so we can maintain proper aspect ratio
      // If selections are in zoomed coordinates, we need to scale them back
      const scaledSelection = {
        ...imageSelection,
        x: imageSelection.x / imageZoom,
        y: imageSelection.y / imageZoom,
        width: imageSelection.width / imageZoom,
        height: imageSelection.height / imageZoom,
      };
      
      const texture = await extractTextureFromSelection(
        loadedImage,
        scaledSelection,
        baseCanvasSize.width,
        baseCanvasSize.height,
        box.surface // Pass surface type for aspect ratio handling
      );
      return { surface: box.surface, texture };
    });
    
    const results = await Promise.all(promises);
    
    // Update store with texture URLs
    const textures = results.reduce<{ top: string | null; left: string | null; right: string | null }>(
      (acc, { surface, texture }) => ({
        ...acc,
        [surface]: texture,
      }),
      { top: null, left: null, right: null }
    );
    
    useStore.setState({ appliedTextures: textures });
    setSelectorOpen(false);
  };
  
  // Redraw when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  
  // Force redraw when dialog opens
  useEffect(() => {
    if (selectorOpen && loadedImage) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        drawCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectorOpen, loadedImage, drawCanvas]);
  
  return (
    <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
      <DialogContent 
        className="!w-[98vw] !max-w-[98vw] h-[98vh] max-h-[98vh] overflow-hidden flex flex-col"
        style={{ maxWidth: '98vw', width: '98vw' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Position Stone Cuts</span>
            <div className="flex gap-2">
              {SELECTION_BOXES.map(box => (
                <Badge key={box.surface} style={{ backgroundColor: box.color }}>
                  {box.label}
                </Badge>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          {/* Calibration and Instructions Side-by-Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Calibration Section - Left Column */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
                📏 Slab Calibration - Total Dimensions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="slab-width" className="text-xs">Total Width (mm)</Label>
                  <Input
                    id="slab-width"
                    type="number"
                    value={slabDimensions.width}
                    onChange={(e) => setSlabDimensions({
                      ...slabDimensions,
                      width: parseInt(e.target.value) || 9600
                    })}
                    className="h-8"
                    placeholder="9600"
                  />
                </div>
                <div>
                  <Label htmlFor="slab-height" className="text-xs">Height (mm)</Label>
                  <Input
                    id="slab-height"
                    type="number"
                    value={slabDimensions.height}
                    onChange={(e) => {
                      const height = parseInt(e.target.value) || 2028;
                      setSlabDimensions({
                        ...slabDimensions,
                        height: height
                      });
                    }}
                    className="h-8"
                    placeholder="2028"
                  />
                </div>
              </div>
              {cachedImageRef.current && (
                <div className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  <div>Image: {cachedImageRef.current.width}×{cachedImageRef.current.height}px</div>
                  <div>Aspect ratio: {(cachedImageRef.current.width / cachedImageRef.current.height).toFixed(2)}</div>
                  {Math.abs((slabDimensions.width / slabDimensions.height) - (cachedImageRef.current.width / cachedImageRef.current.height)) > 0.1 && (
                    <div className="text-orange-600 dark:text-orange-400 font-medium mt-1">
                      ⚠️ Aspect ratio mismatch may cause distortion
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Island Dimensions - Right Column */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Island Cut Dimensions
              </h4>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">Top Surface:</div>
                    <div className="text-blue-700 dark:text-blue-300">{islandDimensions.length} × {islandDimensions.width}mm</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">Side Surfaces:</div>
                    <div className="text-blue-700 dark:text-blue-300">{islandDimensions.width} × {islandDimensions.height}mm</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-300 dark:border-blue-700">
                  <div className="text-blue-600 dark:text-blue-400">
                    Scale: {imageZoom === 1 ? '1:1' : `${(imageZoom * 100).toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {/* Image Zoom Controls */}
              <div className="flex items-center gap-1 px-2 py-1 bg-background rounded border">
                <span className="text-xs text-muted-foreground">View:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  className="h-6 w-6 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium w-12 text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                  className="h-6 w-6 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Transform Controls */}
              {selectedSurface && (
                <div className="flex items-center gap-1 px-2 py-1 bg-background rounded border">
                  <span className="text-xs text-muted-foreground">Transform {selectedSurface}:</span>
                  <div className="flex gap-1 border-l pl-2 ml-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rotateSelection(selectedSurface, 'ccw')}
                      className="h-6 w-6 p-0"
                      title="Rotate Counter-clockwise"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rotateSelection(selectedSurface, 'cw')}
                      className="h-6 w-6 p-0"
                      title="Rotate Clockwise"
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-1 border-l pl-2 ml-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => flipSelection(selectedSurface, 'horizontal')}
                      className="h-6 w-6 p-0"
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => flipSelection(selectedSurface, 'vertical')}
                      className="h-6 w-6 p-0"
                      title="Flip Vertical"
                    >
                      <FlipVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {!selectedSurface && (
                <div className="text-xs text-muted-foreground px-2">
                  <Info className="h-3 w-3 inline mr-1" />
                  Click a selection box to transform it
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Toggle
                pressed={showGrid}
                onPressedChange={setShowGrid}
                aria-label="Toggle grid"
              >
                <Grid3x3 className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={showAlignment}
                onPressedChange={setShowAlignment}
                aria-label="Toggle alignment guides"
              >
                <Maximize2 className="h-4 w-4" />
              </Toggle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectorPan({ x: 0, y: 0 });
                  setImageZoom(1);
                  setSelectedSurface(null);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset View
              </Button>
            </div>
          </div>
          
          {/* Canvas container */}
          <div 
            ref={containerRef}
            className="relative flex-1 border-2 border-border rounded-lg overflow-auto bg-muted/50"
            style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'move' : 'grab' }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="block"
            />
            
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectorOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleApplyTextures}>
              <Check className="h-4 w-4 mr-2" />
              Apply Textures to Island
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}