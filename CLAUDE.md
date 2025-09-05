# Kitchen Island Stone Visualizer - Technical Documentation

## 🎯 Project Overview

A professional-grade web application for visualizing stone slab cutting patterns on kitchen islands. Built with Next.js, React Three Fiber, and modern UI components to help stone fabricators and homeowners optimize cutting layouts for natural stone surfaces.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **3D Rendering**: React Three Fiber + Three.js
- **UI Components**: shadcn/ui (Tailwind CSS)
- **State Management**: Zustand
- **Type Safety**: TypeScript
- **Deployment**: Vercel

### Core Problems Solved
1. **Low texture resolution** - Implemented high-DPI rendering with proper device pixel ratio handling
2. **Small minimap** - Created large, zoomable texture selector with pan controls
3. **Poor pattern visibility** - Added visual guides and alignment tools
4. **Limited usability** - Built professional UI suitable for job site use

## 📁 Project Structure

```
/app
  page.tsx          - Main application entry point
  layout.tsx        - Root layout with metadata
  globals.css       - Global styles and Tailwind

/components
  /stone-visualizer
    Canvas3D.tsx           - 3D scene with React Three Fiber
    TextureSelector.tsx    - High-res texture selection interface
    ControlPanel.tsx       - Modern control interface
    ImageUploader.tsx      - Drag-and-drop image upload
    
  /ui               - shadcn/ui components

/lib
  store.ts          - Zustand state management
  types.ts          - TypeScript type definitions
  utils.ts          - Helper functions
  texture-utils.ts  - Texture processing utilities

/public            - Static assets
```

## 🔧 Key Components

### Canvas3D Component
- React Three Fiber scene with kitchen island model
- PBR materials for realistic rendering
- OrbitControls for camera manipulation
- Environment mapping for reflections
- Real-time shadows
- Device pixel ratio handling for crisp rendering

### TextureSelector Component
**Features:**
- Minimum 800x600px canvas size
- Zoom controls (0.5x to 4x)
- Pan functionality with drag
- Visual alignment guides
- Pattern flow indicators
- Selection boundary visualization
- Touch support for tablets

**Implementation:**
```typescript
// High-resolution canvas rendering
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

### State Management (Zustand)
```typescript
interface StoreState {
  loadedImage: string | null;
  textureScale: number;
  selections: {
    top: Selection;
    left: Selection;
    right: Selection;
  };
  islandDimensions: Dimensions;
  // ... actions
}
```

## 🎨 Texture Processing Pipeline

1. **Image Upload** → Validate and load high-res image
2. **Canvas Rendering** → Draw at device pixel ratio
3. **Selection Mapping** → Map selections to UV coordinates
4. **Texture Generation** → Create power-of-2 textures
5. **Material Application** → Apply to 3D surfaces with proper UV mapping

### Resolution Management
```typescript
// Ensure high-quality textures
const targetResolution = 4096; // 4K textures
const canvas = document.createElement('canvas');
canvas.width = Math.min(targetResolution, img.width);
canvas.height = Math.min(targetResolution, img.height);
```

## 🚀 Performance Optimizations

1. **Texture Loading**
   - Progressive loading (low → high resolution)
   - Texture atlasing for multiple surfaces
   - Mipmap generation for different zoom levels
   - WebGL texture caching

2. **Rendering**
   - Instance rendering for repeated elements
   - Frustum culling
   - LOD system for complex scenes
   - RequestAnimationFrame throttling

3. **Memory Management**
   - Dispose unused textures
   - Canvas pooling
   - Lazy component loading
   - Image compression

## 📊 Critical Metrics

- **Texture Resolution**: 4096x4096 maximum
- **Render FPS**: 60fps target
- **Minimap Size**: 800x600 minimum
- **Load Time**: < 3s for average image
- **Memory Usage**: < 500MB typical

## 🔌 API Structure

### Texture Selection API
```typescript
interface TextureSelection {
  surface: 'top' | 'left' | 'right';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  uvCoords: [number, number, number, number];
}
```

### Island Configuration
```typescript
interface IslandConfig {
  dimensions: {
    length: number;  // mm
    width: number;   // mm
    height: number;  // mm
    thickness: number; // mm
  };
  materials: {
    roughness: number;
    metalness: number;
  };
}
```

## 🧪 Testing Approach

1. **Visual Testing**
   - Texture resolution at various zoom levels
   - Pattern alignment across surfaces
   - Color accuracy

2. **Performance Testing**
   - FPS monitoring
   - Memory profiling
   - Load time benchmarks

3. **Usability Testing**
   - Touch controls on tablets
   - Drag-and-drop on various browsers
   - Responsive layout breakpoints

## 🚢 Deployment Process

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/*": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables
```env
NEXT_PUBLIC_MAX_TEXTURE_SIZE=4096
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Deploy to Vercel
vercel --prod
```

## 📈 Future Enhancements

### Phase 2
- [ ] Multiple slab support for book-matching
- [ ] Edge profile visualization
- [ ] Seam placement optimization
- [ ] AR preview mode

### Phase 3
- [ ] Cloud save/load configurations
- [ ] Collaborative editing
- [ ] Material library integration
- [ ] Cost estimation

### Phase 4
- [ ] Machine learning pattern suggestions
- [ ] Automated grain matching
- [ ] Waste optimization algorithm
- [ ] Integration with CNC machines

## 🐛 Known Issues & Solutions

### Issue: Texture blur on retina displays
**Solution**: Implement device pixel ratio scaling
```typescript
renderer.setPixelRatio(window.devicePixelRatio);
```

### Issue: Memory leak with texture updates
**Solution**: Dispose previous textures
```typescript
oldTexture.dispose();
```

### Issue: Selection drift at high zoom
**Solution**: Use integer pixel coordinates
```typescript
Math.round(x * dpr) / dpr
```

## 📝 Code Style Guide

- Use functional components with hooks
- Implement proper TypeScript types
- Follow React Three Fiber best practices
- Use Zustand for global state
- Keep components < 200 lines
- Document complex algorithms

## 🔒 Security Considerations

- Client-side image processing only
- No server uploads
- Validate file types and sizes
- Sanitize EXIF data
- Limit texture dimensions

## 📚 Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Fundamentals](https://threejs.org/manual/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zustand State Management](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Follow the established patterns
2. Add tests for new features
3. Update this documentation
4. Optimize for performance
5. Consider mobile/tablet users

---

Last Updated: December 2024
Version: 2.0.0