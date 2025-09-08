'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Palette,
  Settings,
  Maximize,
  RotateCw,
  Sun,
  Grid3x3,
  Ruler,
  Download,
  Upload,
  RefreshCw,
  Info
} from 'lucide-react';

export default function ControlPanel() {
  const {
    loadedImage,
    islandDimensions,
    setIslandDimensions,
    setSelectorOpen,
    cameraSettings,
    updateCameraSettings,
    materialSettings,
    updateMaterialSettings,
    viewSettings,
    updateViewSettings,
    resetView,
    exportConfiguration,
  } = useStore();
  
  const handleDimensionChange = (key: keyof typeof islandDimensions, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setIslandDimensions({
        ...islandDimensions,
        [key]: numValue,
      });
    }
  };
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Control Panel
        </CardTitle>
        <CardDescription>
          Configure your kitchen island visualization
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="texture" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="texture">Texture</TabsTrigger>
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Texture Tab */}
          <TabsContent value="texture" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Texture Mapping
              </h3>
              
              <Button
                className="w-full"
                onClick={() => setSelectorOpen(true)}
                disabled={!loadedImage}
              >
                <Maximize className="h-4 w-4 mr-2" />
                Open Texture Selector
              </Button>
              
              {!loadedImage && (
                <p className="text-xs text-muted-foreground mt-2">
                  Upload an image first to enable texture selection
                </p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Material Properties
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="roughness">Roughness</Label>
                    <span className="text-sm text-muted-foreground">
                      {materialSettings.roughness.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="roughness"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[materialSettings.roughness]}
                    onValueChange={([v]) => updateMaterialSettings({ roughness: v })}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="metalness">Metalness</Label>
                    <span className="text-sm text-muted-foreground">
                      {materialSettings.metalness.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="metalness"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[materialSettings.metalness]}
                    onValueChange={([v]) => updateMaterialSettings({ metalness: v })}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="envmap">Reflection Intensity</Label>
                    <span className="text-sm text-muted-foreground">
                      {materialSettings.envMapIntensity.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="envmap"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[materialSettings.envMapIntensity]}
                    onValueChange={([v]) => updateMaterialSettings({ envMapIntensity: v })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* View Tab */}
          <TabsContent value="view" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Camera Controls
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-rotate">Auto Rotate</Label>
                  <Switch
                    id="auto-rotate"
                    checked={cameraSettings.autoRotate}
                    onCheckedChange={(checked) => 
                      updateCameraSettings({ autoRotate: checked })
                    }
                  />
                </div>
                
                {cameraSettings.autoRotate && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rotation-speed">Rotation Speed</Label>
                      <span className="text-sm text-muted-foreground">
                        {cameraSettings.rotationSpeed.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      id="rotation-speed"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[cameraSettings.rotationSpeed]}
                      onValueChange={([v]) => 
                        updateCameraSettings({ rotationSpeed: v })
                      }
                    />
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetView}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Lighting
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="light-intensity">Light Intensity</Label>
                  <span className="text-sm text-muted-foreground">
                    {viewSettings.lightIntensity.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="light-intensity"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[viewSettings.lightIntensity]}
                  onValueChange={([v]) => 
                    updateViewSettings({ lightIntensity: v })
                  }
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Display Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid">Show Grid</Label>
                  <Switch
                    id="show-grid"
                    checked={viewSettings.showGrid}
                    onCheckedChange={(checked) => 
                      updateViewSettings({ showGrid: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-alignment">Show Alignment Guides</Label>
                  <Switch
                    id="show-alignment"
                    checked={viewSettings.showAlignment}
                    onCheckedChange={(checked) => 
                      updateViewSettings({ showAlignment: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-measurements">Show Measurements</Label>
                  <Switch
                    id="show-measurements"
                    checked={viewSettings.showMeasurements}
                    onCheckedChange={(checked) => 
                      updateViewSettings({ showMeasurements: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Island Dimensions (mm)
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="length" className="text-xs">Length</Label>
                    <Input
                      id="length"
                      type="number"
                      value={islandDimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={islandDimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={islandDimensions.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thickness" className="text-xs">Thickness</Label>
                    <Input
                      id="thickness"
                      type="number"
                      value={islandDimensions.thickness}
                      onChange={(e) => handleDimensionChange('thickness', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-muted rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p>Stone surface areas:</p>
                    <ul className="mt-1 space-y-0.5">
                      <li>• Top: {islandDimensions.length}×{islandDimensions.width}mm</li>
                      <li>• Left end: {islandDimensions.width}×{islandDimensions.height}mm</li>
                      <li>• Right end: {islandDimensions.width}×{islandDimensions.height}mm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export & Save
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => exportConfiguration({ 
                    format: 'json', 
                    includeAnnotations: true,
                    includeMeasurements: true
                  })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration (JSON)
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Load Configuration
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}