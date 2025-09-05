import { create } from 'zustand';
import { StoreState, Selection, Dimensions, CameraSettings, MaterialSettings, ViewSettings } from './types';

const defaultDimensions: Dimensions = {
  length: 2440,
  width: 1234,
  height: 880,
  thickness: 20,
};

const defaultSelection = (aspectRatio: number): Selection => ({
  x: 10,
  y: 10,
  width: 200,
  height: 200 / aspectRatio,
  aspectRatio,
});

const defaultCameraSettings: CameraSettings = {
  autoRotate: false,
  rotationSpeed: 0.5,
  position: [4, 3, 5],
};

const defaultMaterialSettings: MaterialSettings = {
  roughness: 0.3,
  metalness: 0.1,
  envMapIntensity: 1.0,
};

const defaultViewSettings: ViewSettings = {
  showGrid: true,
  showAlignment: true,
  showMeasurements: false,
  lightIntensity: 1.0,
};

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  loadedImage: null,
  imageScale: 1,
  slabDimensions: {
    width: 3000, // Default 3m slab
    height: 1800, // Default 1.8m slab
  },
  islandDimensions: defaultDimensions,
  
  selections: {
    top: defaultSelection(defaultDimensions.length / defaultDimensions.width),
    left: defaultSelection(defaultDimensions.length / defaultDimensions.height),
    right: defaultSelection(defaultDimensions.length / defaultDimensions.height),
  },
  
  appliedTextures: {
    top: null,
    left: null,
    right: null,
  },
  
  selectorOpen: false,
  selectorZoom: 1,
  selectorPan: { x: 0, y: 0 },
  
  cameraSettings: defaultCameraSettings,
  materialSettings: defaultMaterialSettings,
  viewSettings: defaultViewSettings,
  
  // Actions
  setLoadedImage: (image) => set({ loadedImage: image }),
  
  setImageScale: (scale) => set({ imageScale: scale }),
  
  setSlabDimensions: (dimensions) => set({ slabDimensions: dimensions }),
  
  setIslandDimensions: (dimensions) => {
    const topAspect = dimensions.length / dimensions.width;
    const sideAspect = dimensions.length / dimensions.height;
    
    set({
      islandDimensions: dimensions,
      selections: {
        top: defaultSelection(topAspect),
        left: defaultSelection(sideAspect),
        right: defaultSelection(sideAspect),
      },
    });
  },
  
  updateSelection: (surface, selection) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [surface]: selection,
      },
    }));
  },
  
  applyTextures: () => {
    const { loadedImage } = get();
    if (!loadedImage) return;
    
    // This will be implemented to generate actual texture URLs
    // For now, we'll just mark that textures have been applied
    set({
      appliedTextures: {
        top: 'applied',
        left: 'applied',
        right: 'applied',
      },
    });
  },
  
  setSelectorOpen: (open) => set({ selectorOpen: open }),
  
  setSelectorZoom: (zoom) => set({ selectorZoom: Math.max(0.5, Math.min(4, zoom)) }),
  
  setSelectorPan: (pan) => set({ selectorPan: pan }),
  
  updateCameraSettings: (settings) => {
    set((state) => ({
      cameraSettings: { ...state.cameraSettings, ...settings },
    }));
  },
  
  updateMaterialSettings: (settings) => {
    set((state) => ({
      materialSettings: { ...state.materialSettings, ...settings },
    }));
  },
  
  updateViewSettings: (settings) => {
    set((state) => ({
      viewSettings: { ...state.viewSettings, ...settings },
    }));
  },
  
  resetView: () => {
    set({
      cameraSettings: defaultCameraSettings,
      selectorZoom: 1,
      selectorPan: { x: 0, y: 0 },
    });
  },
  
  exportConfiguration: (settings) => {
    const state = get();
    const config = {
      dimensions: state.islandDimensions,
      selections: state.selections,
      timestamp: new Date().toISOString(),
    };
    
    // Implementation for different export formats
    switch (settings.format) {
      case 'json':
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stone-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'pdf':
        // PDF export would be implemented here
        console.log('PDF export not yet implemented');
        break;
      case 'png':
        // PNG export would be implemented here
        console.log('PNG export not yet implemented');
        break;
    }
  },
}));