export interface Dimensions {
  length: number; // mm
  width: number;  // mm
  height: number; // mm
  thickness: number; // mm
}

export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface TextureSelection {
  surface: 'top' | 'left' | 'right';
  bounds: Selection;
  uvCoords: [number, number, number, number];
}

export interface MaterialSettings {
  roughness: number;
  metalness: number;
  envMapIntensity: number;
}

export interface CameraSettings {
  autoRotate: boolean;
  rotationSpeed: number;
  position: [number, number, number];
}

export interface ViewSettings {
  showGrid: boolean;
  showAlignment: boolean;
  showMeasurements: boolean;
  lightIntensity: number;
}

export interface ExportSettings {
  format: 'pdf' | 'png' | 'json';
  includeAnnotations: boolean;
  includeMeasurements: boolean;
}

export type Surface = 'top' | 'left' | 'right';

export interface StoreState {
  // Image
  loadedImage: string | null;
  imageScale: number;
  
  // Dimensions
  islandDimensions: Dimensions;
  
  // Selections
  selections: {
    top: Selection;
    left: Selection;
    right: Selection;
  };
  
  // Textures
  appliedTextures: {
    top: string | null;
    left: string | null;
    right: string | null;
  };
  
  // UI State
  selectorOpen: boolean;
  selectorZoom: number;
  selectorPan: { x: number; y: number };
  
  // 3D Settings
  cameraSettings: CameraSettings;
  materialSettings: MaterialSettings;
  viewSettings: ViewSettings;
  
  // Actions
  setLoadedImage: (image: string | null) => void;
  setImageScale: (scale: number) => void;
  setIslandDimensions: (dimensions: Dimensions) => void;
  updateSelection: (surface: Surface, selection: Selection) => void;
  applyTextures: () => void;
  setSelectorOpen: (open: boolean) => void;
  setSelectorZoom: (zoom: number) => void;
  setSelectorPan: (pan: { x: number; y: number }) => void;
  updateCameraSettings: (settings: Partial<CameraSettings>) => void;
  updateMaterialSettings: (settings: Partial<MaterialSettings>) => void;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
  resetView: () => void;
  exportConfiguration: (settings: ExportSettings) => void;
}