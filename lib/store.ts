import { create } from 'zustand';
import { StoreState, Selection, Dimensions, CameraSettings, MaterialSettings, ViewSettings } from './types';

const defaultDimensions: Dimensions = {
  length: 2440,
  width: 1234,
  height: 880,
  thickness: 20,
};

const defaultRunDimensions = {
  length: 3000,
  depth: 600,
  thickness: 20,
  backsplashHeight: 580,
};

const defaultSelection = (width: number, height: number): Selection => {
  // Create selections sized proportionally to actual island dimensions
  // Scale down to reasonable canvas sizes while maintaining aspect ratio
  const scale = 0.15; // Scale factor to make selections visible on canvas
  return {
    x: 10,
    y: 10,
    width: width * scale,
    height: height * scale,
    aspectRatio: width / height,
    rotation: 0, // Default to no rotation
    flipH: false, // Default to no horizontal flip
    flipV: false, // Default to no vertical flip
  };
};

const defaultCameraSettings: CameraSettings = {
  autoRotate: false,
  rotationSpeed: 0.5,
  position: [4, 3, 5],
  target: [0, 0, 0],
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
  loadedImage: '/L25155.jpg',
  imageScale: 1,
  slabDimensions: {
    width: 9060, // Default for 3 slabs side-by-side (3020mm each)
    height: 2020, // Default slab height
  },
  islandDimensions: defaultDimensions,
  kitchenRunDimensions: defaultRunDimensions,
  
  selections: {
    top: defaultSelection(defaultDimensions.length, defaultDimensions.width),
    left: defaultSelection(defaultDimensions.width, defaultDimensions.height),
    right: defaultSelection(defaultDimensions.width, defaultDimensions.height),
    countertop: defaultSelection(defaultRunDimensions.length, defaultRunDimensions.depth),
    backsplash: defaultSelection(defaultRunDimensions.length, defaultRunDimensions.backsplashHeight),
  },
  
  appliedTextures: {
    top: null,
    left: null,
    right: null,
    countertop: null,
    backsplash: null,
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
    set({
      islandDimensions: dimensions,
      selections: {
        top: defaultSelection(dimensions.length, dimensions.width),
        left: defaultSelection(dimensions.width, dimensions.height),
        right: defaultSelection(dimensions.width, dimensions.height),
        // keep existing run selections unchanged
        countertop: get().selections.countertop,
        backsplash: get().selections.backsplash,
      },
    });
  },
  
  // Optional setter for kitchen run
  setKitchenRunDimensions: (run) => {
    const rd = { ...get().kitchenRunDimensions, ...run };
    set({
      kitchenRunDimensions: rd,
      selections: {
        ...get().selections,
        countertop: defaultSelection(rd.length, rd.depth),
        backsplash: defaultSelection(rd.length, rd.backsplashHeight),
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
        countertop: 'applied',
        backsplash: 'applied',
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
