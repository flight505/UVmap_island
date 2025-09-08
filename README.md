# Kitchen Island Stone Visualizer

A professional web application for visualizing and planning stone slab cutting patterns on kitchen islands. Designed for stone fabricators and contractors to optimize cutting layouts while ensuring pattern continuity across surfaces.

## 🎯 Purpose

This tool helps stone fabricators:
- Visualize how marble veins and granite patterns will flow across kitchen island surfaces
- Plan optimal cutting positions to minimize waste
- Ensure pattern continuity across the top and side surfaces
- Preview the final result in 3D before making any cuts

## 📏 Understanding the Scaling System

### How It Works
The application uses a consistent millimeter-to-pixel scaling system:
- **1mm = 0.3 pixels** on the canvas display
- This means a 3000mm slab width displays as 900 pixels on screen
- All selections maintain real-world proportions

### Slab Dimensions
Default slab configuration represents 3 standard slabs side-by-side:
- **Total Width**: 9600mm (3 × 3200mm slabs)
- **Height**: 2028mm (standard slab height)

### Island Dimensions
Default kitchen island dimensions:
- **Length**: 2440mm (top surface length)
- **Width**: 1234mm (top surface width)  
- **Height**: 880mm (side surface height)
- **Thickness**: 20mm (stone thickness)

## 🚀 Quick Start Guide

### 1. Upload Your Slab Image
- Click "Upload Slab Image" or drag and drop
- Use a high-resolution photo of your stone slab(s)
- The image will automatically scale to match the slab dimensions

### 2. Set Your Dimensions
- Click "Dimensions" in the control panel
- Enter your actual island measurements in millimeters
- The selection boxes will automatically resize to match

### 3. Position Your Cuts
- Click "Open Texture Selector" to begin
- You'll see three selection boxes:
  - **Green**: Top surface (length × width)
  - **Blue**: Left end surface (width × height)
  - **Purple**: Right end surface (width × height)

### 4. Align Patterns
Use the controls to ensure pattern flow:

#### Rotation Controls
- **0°**: No rotation
- **90°**: Quarter turn clockwise
- **180°**: Half turn
- **270°**: Three-quarter turn clockwise

#### Flip Controls
- **Flip H**: Mirror horizontally (useful for book-matching)
- **Flip V**: Mirror vertically

### 5. Fine-Tune Position
- **Drag** selections to position them on the slab
- **Zoom** to see pattern details (scroll or use buttons)
- **Pan** the view by dragging outside selections

### 6. Apply and Preview
- Click "Apply Textures" to see the result
- Use the 3D view to inspect all surfaces
- Rotate the model to check pattern alignment

## 🎨 Pattern Alignment Tips

### For Marble/Granite with Veining
1. **Identify the main vein direction** in your slab
2. **Align the top surface** with the primary vein flow
3. **Position side surfaces** to continue the vein pattern
4. **Use rotation** to match grain direction across edges
5. **Use flip** for book-matched patterns on opposite ends

### Example Workflow
1. Position the top surface on the most attractive part of the slab
2. Rotate if needed to align veins with the island's length
3. Position left side to continue the pattern from the top
4. Mirror the right side for a book-matched effect
5. Fine-tune all positions before cutting

## 🔧 Controls Reference

### Texture Selector Dialog
- **Canvas Display**: Shows your slab with selection overlays
- **Selection Info**: Each box shows its target surface and actual dimensions
- **Transformation Indicators**: Shows current rotation (°) and flips (↔↕)

### Control Panel Options
- **Dimensions**: Set island and slab measurements
- **Materials**: Adjust surface properties (roughness, metalness)
- **Camera**: Control auto-rotation and view angle
- **View Settings**: Toggle grid, measurements, and lighting

### Keyboard Shortcuts
- **Escape**: Close texture selector
- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan view or move selections

## 📐 Important Notes

### Surface Mapping
- **Top Surface**: The horizontal work surface
- **Left/Right Ends**: The vertical end panels (not front/back with drawers)
- Stone is applied to top and ends only, not drawer faces

### Scaling Behavior
- The uploaded image scales to match your slab dimensions
- Selection boxes show actual cutting dimensions
- Canvas zoom is for viewing only - doesn't change cut sizes

### Best Practices
1. Always upload high-resolution slab photos
2. Set accurate dimensions before positioning cuts
3. Consider pattern flow across all visible edges
4. Save your configuration before making actual cuts

## 🛠️ Technical Requirements

- **Browser**: Chrome, Firefox, Safari (latest versions)
- **Screen**: Minimum 1280×720, larger displays recommended
- **Images**: JPG/PNG, ideally 4000px+ width for best quality
- **Performance**: WebGL support required for 3D preview

## 📊 Dimension Examples

### Small Island
- Length: 1800mm, Width: 900mm, Height: 900mm
- Fits within a single 3200×2000mm slab

### Standard Island  
- Length: 2440mm, Width: 1220mm, Height: 900mm
- Requires strategic positioning across 2 slabs

### Large Island
- Length: 3000mm, Width: 1500mm, Height: 900mm  
- Needs careful planning across multiple slabs

## 🔍 Troubleshooting

### Image appears distorted
- Check that slab dimensions match your actual slabs
- Ensure image aspect ratio matches slab proportions

### Selections seem wrong size
- Verify island dimensions are entered correctly
- Remember dimensions are in millimeters

### Pattern doesn't align
- Use rotation to match grain direction
- Try flip options for book-matching
- Adjust position by dragging selections

### 3D preview not loading
- Check WebGL support in your browser
- Try refreshing the page
- Ensure hardware acceleration is enabled

## 💡 Pro Tips

1. **Take slab photos straight-on** to minimize perspective distortion
2. **Include a ruler** in photos for scale reference
3. **Mark defects** to avoid them in your cutting plan
4. **Consider remnants** - position cuts to maximize usable leftover pieces
5. **Document settings** - screenshot or export your configuration before cutting

## 🚀 Development

### Setup
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build
```bash
npm run build
npm start
```

### Technologies
- **Next.js 15** - React framework
- **React Three Fiber** - 3D rendering
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **TypeScript** - Type safety

## 📝 Version History

- **v2.0.0** - Complete rebuild with consistent scaling system
- **v1.5.0** - Added rotation and flip controls
- **v1.0.0** - Initial release

## 📧 Support

For issues or suggestions, please contact your stone fabrication supplier or visit the project repository.

---

*Built for professional stone fabricators and contractors*
