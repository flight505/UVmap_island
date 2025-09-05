# Kitchen Island Stone Visualizer

## 📋 Project Overview

The Kitchen Island Stone Visualizer is an interactive 3D web application designed to help homeowners and fabricators plan the optimal cutting layout for natural stone slabs. This tool solves the critical challenge of visualizing how stone grain patterns will appear on different surfaces of a kitchen island before making irreversible cuts in expensive material.

## 🎯 Problem Statement

When working with natural stone slabs (granite, marble, quartzite, etc.), the pattern and grain flow are unique to each piece. For a kitchen island requiring three surfaces (top and two sides), determining the optimal cutting positions to achieve the best aesthetic result is challenging because:

- Stone slabs have natural variations in pattern that need to flow harmoniously
- Cuts are permanent and expensive mistakes cannot be undone
- It's difficult to visualize how 2D cuts will look on a 3D object
- Photos of stone slabs often have perspective distortion

## 💡 Solution

This tool provides a real-time 3D visualization system that allows users to:
1. Upload an image of their stone slab(s)
2. Position virtual "cuts" on the stone image
3. See how those cuts will appear on a 3D model of their kitchen island
4. Rotate and examine the island from all angles with realistic lighting

## ✨ Key Features

### Visual Selection System
- **Drag-and-drop rectangles** represent the actual cut dimensions
- **Color-coded surfaces** (Red=Top, Cyan=Left, Blue=Right)
- **Proportionally accurate** rectangles match real surface aspect ratios
- **Real-time preview** of selection areas on the stone image

### 3D Visualization
- **Accurate dimensions**: 2440mm × 1234mm × 880mm (customizable in code)
- **Interactive controls**: Click and drag to rotate, scroll to zoom
- **Adjustable lighting** to see how stone appears under different conditions
- **Auto-rotation mode** for hands-free viewing

### Technical Specifications
- **20mm stone thickness** assumption for accurate representation
- **Three surfaces**: Top plate and two long sides (no front/back needed)
- **Scalable image viewing** to work with high-resolution stone photos
- **Perspective correction guidance** for preparing stone images

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Digital photo(s) of your stone slab(s)
- Image editing software for perspective correction (optional)

### Installation
1. Save the HTML file to your computer
2. Open it in any web browser
3. No installation or server required - runs entirely in your browser

### Preparing Your Stone Image

#### Perspective Correction (Recommended)
Since stone slabs are often photographed at an angle, correct the perspective first:

1. **In Photoshop/GIMP/Pixelmate Pro:**
   - Use the Perspective/Distortion tool
   - Align the corners to form a rectangle
   - Ensure edges are parallel
   
2. **Quick method:**
   - Place markers at the actual corners
   - Use transform tools to square the image
   - Export as high-resolution JPG/PNG

## 📖 Usage Guide

### Step 1: Load Your Stone Image
- Click "Choose File" and select your stone slab photo
- The image should show your slabs arranged side by side

### Step 2: Position the Cuts
1. Click **"Open Texture Selector"**
2. Three colored rectangles appear on your stone image
3. **Drag each rectangle** to position it over the desired pattern area:
   - Consider grain flow between surfaces
   - Look for feature patterns you want to highlight
   - Avoid placing cuts through defects or undesirable areas

### Step 3: Apply and View
1. Click **"Apply Textures to Island"**
2. The 3D model updates with your selected textures
3. Rotate the model to view from different angles
4. Adjust lighting to see surface details

### Step 4: Refine
- Not satisfied? Click "Open Texture Selector" again
- Reposition the rectangles
- Try different arrangements until you find the perfect layout

## 🔧 Technical Details

### Technologies Used
- **Three.js** - 3D graphics rendering
- **HTML5 Canvas** - Texture selection interface
- **Vanilla JavaScript** - No framework dependencies
- **WebGL** - Hardware-accelerated 3D graphics

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Runs entirely client-side (no server needed)
- Handles images up to 4K resolution
- Smooth 60fps rendering on modern hardware

## 🎨 Customization

### Modifying Dimensions
To adjust for your specific island size, edit these values in the code:
```javascript
const dimensions = {
    length: 2440,  // mm
    width: 1234,   // mm
    height: 880,   // mm
    thickness: 20  // mm
};
```

### Adding More Surfaces
The tool currently handles three surfaces but can be extended for:
- End panels
- Waterfall edges
- Multiple height levels

## 💰 Benefits

### Cost Savings
- Avoid expensive cutting mistakes
- Reduce material waste
- Minimize need for multiple stone slabs

### Time Efficiency
- Instant visualization vs. paper templates
- Quick iteration through different options
- Confident decision-making before cutting

### Professional Results
- Optimal pattern flow between surfaces
- Highlight the stone's best features
- Achieve designer-quality results

## 🤝 Use Cases

### Homeowners
- Plan DIY kitchen renovations
- Communicate preferences to fabricators
- Make informed material selection decisions

### Stone Fabricators
- Show clients different cutting options
- Document planned cuts before execution
- Reduce revision requests and dissatisfaction

### Interior Designers
- Present visualization to clients
- Coordinate pattern flow with overall design
- Ensure stone selection meets aesthetic goals

## ⚠️ Limitations

- Requires perspective-corrected images for best results
- Color accuracy depends on photo quality and monitor calibration
- Does not account for stone thickness variations or edge profiles
- Cannot simulate actual fabrication constraints (equipment limitations, etc.)

## 🔮 Future Enhancements

Potential improvements could include:
- Multiple slab support for book-matching
- Edge profile visualization
- Seam placement optimization
- Export cutting diagrams for fabricators
- Mobile device support
- Save/load configurations
- Integration with stone supplier catalogs

## 📝 License

This tool is provided as-is for personal and commercial use. No warranty is provided for cutting decisions made using this tool.

## 🙏 Acknowledgments

Built using:
- Three.js by mrdoob and contributors
- Inspired by the challenges of natural stone fabrication
- Designed for the specific needs of kitchen island construction

---

*This tool was created to bridge the gap between imagination and reality in stone fabrication, helping ensure that beautiful natural materials are used to their fullest potential.*