'use client';

import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls as OrbitControlsImpl, 
  Environment, 
  Grid, 
  PerspectiveCamera,
  useTexture,
  Box,
  Stats
} from '@react-three/drei';
// import type { OrbitControls } from 'three-stdlib';
import * as THREE from 'three';
import { useStore } from '@/lib/store';

const SCALE = 0.001; // mm to scene units

interface KitchenIslandProps {
  topTexture?: string | null;
  leftTexture?: string | null;
  rightTexture?: string | null;
}

// Separate component for texture loading to avoid conditional hooks
function TexturedIsland({ topTexture, leftTexture, rightTexture }: KitchenIslandProps) {
  const topTextureLoaded = useTexture(topTexture!);
  const leftTextureLoaded = useTexture(leftTexture!);
  const rightTextureLoaded = useTexture(rightTexture!);
  
  return (
    <IslandMesh
      topTexture={topTextureLoaded}
      leftTexture={leftTextureLoaded}
      rightTexture={rightTextureLoaded}
    />
  );
}

function IslandMesh({ 
  topTexture, 
  leftTexture, 
  rightTexture 
}: { 
  topTexture?: THREE.Texture | null;
  leftTexture?: THREE.Texture | null;
  rightTexture?: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { islandDimensions, materialSettings, cameraSettings, selections } = useStore();
  
  // Auto-rotate if enabled
  useFrame((state, delta) => {
    if (meshRef.current && cameraSettings.autoRotate) {
      meshRef.current.rotation.y += delta * cameraSettings.rotationSpeed;
    }
  });
  
  // Configure textures for high quality; apply rotation + flips at render time
  useEffect(() => {
    const configureTexture = (texture: THREE.Texture | null | undefined, selection?: { rotation: number; flipH: boolean; flipV: boolean }) => {
      if (!texture) return;
      // Use RepeatWrapping to support negative repeats for flips
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.generateMipmaps = true;
      
      // Apply rotation around center; invert sign to match 2D canvas orientation
      texture.center.set(0.5, 0.5);
      const rotationDegrees = selection?.rotation ?? 0;
      texture.rotation = - (rotationDegrees * Math.PI) / 180;
      
      const flipH = selection?.flipH ?? false;
      const flipV = selection?.flipV ?? false;
      const repeatX = flipH ? -1 : 1;
      const repeatY = flipV ? -1 : 1;
      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(flipH ? 1 : 0, flipV ? 1 : 0);
      
      texture.needsUpdate = true;
    };
    
    configureTexture(topTexture, selections?.top);
    configureTexture(leftTexture, selections?.left);
    configureTexture(rightTexture, selections?.right);
  }, [topTexture, leftTexture, rightTexture, selections]);
  
  // Create geometry with proper dimensions
  const boxWidth = islandDimensions.length * SCALE;
  const boxHeight = islandDimensions.height * SCALE;
  const boxDepth = islandDimensions.width * SCALE;
  
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  
  
  // Create materials for each face
  const materials = [
    // Right face (+X) - right end of island
    new THREE.MeshStandardMaterial({ 
      map: rightTexture,
      color: rightTexture ? 0xffffff : 0x707070,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
      envMapIntensity: materialSettings.envMapIntensity,
    }),
    // Left face (-X) - left end of island
    new THREE.MeshStandardMaterial({ 
      map: leftTexture,
      color: leftTexture ? 0xffffff : 0x707070,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
      envMapIntensity: materialSettings.envMapIntensity,
    }),
    // Top face (+Y)
    new THREE.MeshStandardMaterial({ 
      map: topTexture,
      color: topTexture ? 0xffffff : 0x808080,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
      envMapIntensity: materialSettings.envMapIntensity,
    }),
    // Bottom face (-Y)
    new THREE.MeshStandardMaterial({ 
      color: 0x404040,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Front face (+Z) - front side with drawers
    new THREE.MeshStandardMaterial({ 
      color: 0x606060,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
    }),
    // Back face (-Z) - back side with drawers
    new THREE.MeshStandardMaterial({ 
      color: 0x606060,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
    }),
  ];
  
  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={materials}
      castShadow
      receiveShadow
    />
  );
}

function Scene() {
  const { 
    appliedTextures, 
    viewSettings,
    islandDimensions
  } = useStore();
  const { gl } = useThree();
  
  // Set pixel ratio for high DPI displays
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
  }, [gl]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6 * viewSettings.lightIntensity} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8 * viewSettings.lightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight 
        position={[-5, 5, -5]} 
        intensity={0.5 * viewSettings.lightIntensity} 
      />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Kitchen Island */}
      <Suspense fallback={<Box args={[2, 1, 1]} />}>
        {(appliedTextures.top || appliedTextures.left || appliedTextures.right) ? (
          <TexturedIsland
            topTexture={appliedTextures.top}
            leftTexture={appliedTextures.left}
            rightTexture={appliedTextures.right}
          />
        ) : (
          <IslandMesh
            topTexture={null}
            leftTexture={null}
            rightTexture={null}
          />
        )}
      </Suspense>
      
      {/* Floor/Grid */}
      {viewSettings.showGrid && (
        <Grid 
          args={[20, 20]}
          position={[0, -(islandDimensions.height * SCALE) / 2 - 0.01, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d9d9d"
          fadeDistance={20}
          fadeStrength={1}
          followCamera={false}
        />
      )}
      
      {/* Measurement indicators would go here */}
      {viewSettings.showMeasurements && (
        <group>
          {/* Add measurement lines and labels */}
        </group>
      )}
    </>
  );
}

function CameraController() {
  const { cameraSettings } = useStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    if (controlsRef.current && !cameraSettings.autoRotate) {
      // Reset controls when switching from auto-rotate
      controlsRef.current.reset();
    }
  }, [cameraSettings.autoRotate]);
  
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraSettings.position}
        fov={60}
        near={0.1}
        far={1000}
      />
      <OrbitControlsImpl
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={controlsRef as any}
        enablePan={true}
        enableZoom={true}
        enableRotate={!cameraSettings.autoRotate}
        minDistance={2}
        maxDistance={15}
        target={[0, 0, 0]}
        // Smooth controls
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        panSpeed={0.5}
      />
    </>
  );
}

export default function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]} // Use device pixel ratio up to 2x
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          powerPreference: 'high-performance',
          alpha: false,
          preserveDrawingBuffer: true, // Needed for screenshots
        }}
        style={{ background: 'linear-gradient(180deg, #e0e7ff 0%, #f0f4f8 100%)' }}
      >
        <CameraController />
        <Scene />
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      
      {/* Loading indicator */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <Suspense fallback={
          <div className="bg-white/80 backdrop-blur px-3 py-2 rounded-md text-sm">
            Loading 3D Scene...
          </div>
        }>
          {null}
        </Suspense>
      </div>
    </div>
  );
}
