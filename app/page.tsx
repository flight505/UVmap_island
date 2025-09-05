'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ImageUploader from '@/components/stone-visualizer/ImageUploader';
import TextureSelector from '@/components/stone-visualizer/TextureSelector';
import ControlPanel from '@/components/stone-visualizer/ControlPanel';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Info,
  Github,
  FileText
} from 'lucide-react';

// Dynamically import Canvas3D to avoid SSR issues
const Canvas3D = dynamic(
  () => import('@/components/stone-visualizer/Canvas3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading 3D Scene...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Kitchen Island Stone Visualizer</h1>
              <Badge variant="secondary">v2.0</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="/README.md"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 border-r bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Instructions */}
            <Card className="bg-muted/50">
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Quick Start:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Upload a photo of your stone slab</li>
                      <li>Click &quot;Open Texture Selector&quot;</li>
                      <li>Position the cut areas on your stone</li>
                      <li>View the result in 3D</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Image Uploader */}
            <div>
              <h2 className="text-sm font-medium mb-2">Stone Slab Image</h2>
              <ImageUploader />
            </div>
            
            <Separator />
            
            {/* Control Panel */}
            <ControlPanel />
          </div>
        </div>
        
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Initializing...</p>
              </div>
            </div>
          }>
            <Canvas3D />
          </Suspense>
          
          {/* Watermark */}
          <div className="absolute bottom-4 left-4 pointer-events-none">
            <div className="bg-background/80 backdrop-blur px-3 py-2 rounded-md">
              <p className="text-xs text-muted-foreground">
                Click and drag to rotate • Scroll to zoom
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Ready</span>
              </div>
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Texture Selector Dialog */}
      <TextureSelector />
    </div>
  );
}
