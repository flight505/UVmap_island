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
  ZoomIn, 
  ZoomOut, 
  Move, 
  Grid3x3, 
  Maximize2,
  RotateCcw,
  Check,
  X
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
  
  const {
    loadedImage,
    selectorOpen,
    setSelectorOpen,
    selectorZoom,
    setSelectorZoom,
    selectorPan,
    setSelectorPan,
    selections,
    updateSelection,
    islandDimensions,
    slabDimensions,
    setSlabDimensions,
  } = useStore();
  
  // Cache the image when it changes
  useEffect(() => {
    if (!loadedImage) {
      cachedImageRef.current = null;
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      cachedImageRef.current = img;
      const aspectRatio = img.width / img.height;
      const baseWidth = Math.max(MIN_CANVAS_WIDTH, Math.min(1200, img.width * 0.8));
      const baseHeight = baseWidth / aspectRatio;
      
      setCanvasSize({
        width: baseWidth * selectorZoom,
        height: baseHeight * selectorZoom,
      });
    };
    img.src = loadedImage;
  }, [loadedImage, selectorZoom]);
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, selectorPan, selections, showGrid, showAlignment]);
  
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
    ctx.strokeStyle = box.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = box.color + '33'; // 20% opacity
    
    // Draw rectangle
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    
    // Draw label
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textX = selection.x + selection.width / 2;
    const textY = selection.y + selection.height / 2;
    
    ctx.strokeText(box.label, textX, textY);
    ctx.fillText(box.label, textX, textY);
    
    // Draw actual island surface dimensions
    ctx.font = '12px Arial';
    ctx.fillStyle = box.color;
    // Show the actual island surface dimensions for each face
    let surfaceText = '';
    if (box.surface === 'top') {
      surfaceText = `${islandDimensions.length}×${islandDimensions.width}mm`;
    } else {
      // Both left and right sides have same dimensions
      surfaceText = `${islandDimensions.length}×${islandDimensions.height}mm`;
    }
    ctx.fillText(surfaceText, textX, selection.y - 5);
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
  
  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left - selectorPan.x;
    const y = e.clientY - rect.top - selectorPan.y;
    
    // Check if clicking on a selection box
    for (const box of SELECTION_BOXES) {
      const selection = selections[box.surface];
      if (
        x >= selection.x &&
        x <= selection.x + selection.width &&
        y >= selection.y &&
        y <= selection.y + selection.height
      ) {
        setIsDragging(box.surface);
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
    if (!loadedImage) return;
    
    // Generate texture URLs for each surface
    const promises = SELECTION_BOXES.map(async (box) => {
      const texture = await extractTextureFromSelection(
        loadedImage,
        selections[box.surface],
        canvasSize.width,
        canvasSize.height
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
      <DialogContent className="w-[98vw] h-[98vh] max-h-[98vh] overflow-hidden flex flex-col">
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
          {/* Calibration Section */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-amber-900 dark:text-amber-100">
              📏 Slab Calibration - Total Dimensions of 3 Connected Slabs
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slab-width" className="text-xs">Total Width of 3 Slabs (mm)</Label>
                <Input
                  id="slab-width"
                  type="number"
                  value={slabDimensions.width}
                  onChange={(e) => setSlabDimensions({
                    ...slabDimensions,
                    width: parseInt(e.target.value) || 9060
                  })}
                  className="h-8"
                  placeholder="e.g., 9060 for 3×3020mm"
                />
              </div>
              <div>
                <Label htmlFor="slab-height" className="text-xs">Slab Height (mm)</Label>
                <Input
                  id="slab-height"
                  type="number"
                  value={slabDimensions.height}
                  onChange={(e) => setSlabDimensions({
                    ...slabDimensions,
                    height: parseInt(e.target.value) || 2020
                  })}
                  className="h-8"
                  placeholder="e.g., 2020"
                />
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
              ℹ️ Your image shows 3 slabs side-by-side. Enter the combined width of all 3 slabs and their height.
              Position the colored rectangles on each slab area (left, top, right) to map them to your island surfaces.
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectorZoom(Math.max(0.5, selectorZoom - 0.25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Slider
                  value={[selectorZoom]}
                  onValueChange={([v]) => setSelectorZoom(v)}
                  min={0.5}
                  max={4}
                  step={0.25}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{Math.round(selectorZoom * 100)}%</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectorZoom(Math.min(4, selectorZoom + 0.25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
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
                  setSelectorZoom(1);
                  setSelectorPan({ x: 0, y: 0 });
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
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
            
            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-md text-sm max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <Move className="h-4 w-4" />
                <span>Position cuts on your 3-slab layout</span>
              </div>
              <div className="text-muted-foreground text-xs space-y-1">
                <div>• Left box → Left slab → Left side of island</div>
                <div>• Top box → Middle slab → Top of island</div>
                <div>• Right box → Right slab → Right side of island</div>
                <div className="pt-1 border-t border-border mt-1">Click and drag boxes to position • Pan with empty space • Zoom with controls</div>
              </div>
            </div>
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