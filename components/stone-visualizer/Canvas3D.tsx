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
  Stats,
  ContactShadows
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
  const { gl } = useThree();
  
  // Auto-rotate if enabled
  useFrame((state, delta) => {
    if (meshRef.current && cameraSettings.autoRotate) {
      meshRef.current.rotation.y += delta * cameraSettings.rotationSpeed;
    }
  });
  
  // Configure textures for high quality; no runtime rotation/flips (baked during extraction)
  useEffect(() => {
    const configureTexture = (texture: THREE.Texture | null | undefined, selection?: { rotation: number; flipH: boolean; flipV: boolean }) => {
      if (!texture) return;
      // Clamp to edges to avoid seams since we don't repeat/flip at runtime
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const maxAniso = gl.capabilities.getMaxAnisotropy?.() || 16;
      texture.anisotropy = Math.min(32, maxAniso);
      texture.generateMipmaps = true;
      // Proper color management for photographic textures
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // No rotation/flip at runtime; it's baked into the bitmap
      texture.center.set(0.5, 0.5);
      texture.rotation = 0;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      
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
  
  
  // Create materials for each face (use Physical material for richer highlights)
  const materials = [
    // Right face (+X)
    new THREE.MeshPhysicalMaterial({ 
      map: rightTexture || undefined,
      color: rightTexture ? 0xffffff : 0x707070,
      roughness: materialSettings.roughness,
      metalness: Math.min(1, materialSettings.metalness),
      envMapIntensity: materialSettings.envMapIntensity,
      clearcoat: 0.1,
      clearcoatRoughness: 0.6,
      ior: 1.45,
    }),
    // Left face (-X)
    new THREE.MeshPhysicalMaterial({ 
      map: leftTexture || undefined,
      color: leftTexture ? 0xffffff : 0x707070,
      roughness: materialSettings.roughness,
      metalness: Math.min(1, materialSettings.metalness),
      envMapIntensity: materialSettings.envMapIntensity,
      clearcoat: 0.1,
      clearcoatRoughness: 0.6,
      ior: 1.45,
    }),
    // Top face (+Y)
    new THREE.MeshPhysicalMaterial({ 
      map: topTexture || undefined,
      color: topTexture ? 0xffffff : 0x808080,
      roughness: Math.max(0.2, materialSettings.roughness * 0.9),
      metalness: Math.min(1, materialSettings.metalness),
      envMapIntensity: materialSettings.envMapIntensity * 1.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
      ior: 1.45,
    }),
    // Bottom face (-Y)
    new THREE.MeshStandardMaterial({ 
      color: 0x404040,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Front face (+Z)
    new THREE.MeshStandardMaterial({ 
      color: 0x606060,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metalness,
    }),
    // Back face (-Z)
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

// Countertop Mesh (wall run)
function CountertopMesh({ texture }: { texture?: THREE.Texture | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { islandDimensions, kitchenRunDimensions, materialSettings } = useStore();
  const { gl } = useThree();

  // Configure map
  useEffect(() => {
    if (!texture) return;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() || 16;
    texture.anisotropy = Math.min(32, maxAniso);
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.center.set(0.5, 0.5);
    texture.rotation = 0;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
  }, [texture, gl]);

  const len = kitchenRunDimensions.length * SCALE;
  const thick = kitchenRunDimensions.thickness * SCALE;
  const depth = kitchenRunDimensions.depth * SCALE;

  // Gap between island and wall run (1.0 m default)
  const gap = 1000 * SCALE;

  // Place behind island along -Z
  const islandDepth = islandDimensions.width * SCALE;
  const z = - (islandDepth / 2 + gap + depth / 2);
  // Top flush with island top
  const y = islandDimensions.height * SCALE / 2 - thick / 2;

  const geom = new THREE.BoxGeometry(len, thick, depth);

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x707070, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // +X
    new THREE.MeshStandardMaterial({ color: 0x707070, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // -X
    new THREE.MeshPhysicalMaterial({ map: texture || undefined, color: texture ? 0xffffff : 0x808080, roughness: Math.max(0.2, materialSettings.roughness * 0.9), metalness: materialSettings.metalness, clearcoat: 0.2, clearcoatRoughness: 0.5, envMapIntensity: materialSettings.envMapIntensity }), // +Y (top)
    new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8, metalness: 0.2 }), // -Y
    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // +Z
    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // -Z
  ];

  return (
    <mesh ref={meshRef} position={[0, y, z]} geometry={geom} material={materials} castShadow receiveShadow />
  );
}

function TexturedCountertop({ textureUrl }: { textureUrl?: string | null }) {
  const tex = useTexture(textureUrl!);
  return <CountertopMesh texture={tex} />;
}

// Backsplash Mesh
function BacksplashMesh({ texture }: { texture?: THREE.Texture | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { islandDimensions, kitchenRunDimensions, materialSettings } = useStore();
  const { gl } = useThree();

  useEffect(() => {
    if (!texture) return;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() || 16;
    texture.anisotropy = Math.min(32, maxAniso);
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.center.set(0.5, 0.5);
    texture.rotation = 0;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
  }, [texture, gl]);

  const len = kitchenRunDimensions.length * SCALE;
  const height = kitchenRunDimensions.backsplashHeight * SCALE;
  const thick = kitchenRunDimensions.thickness * SCALE;
  const depth = kitchenRunDimensions.depth * SCALE;

  const gap = 1000 * SCALE;
  const islandDepth = islandDimensions.width * SCALE;
  const countertopZ = - (islandDepth / 2 + gap + depth / 2);
  const z = countertopZ - (depth / 2 - thick / 2); // sit at back edge
  const y = islandDimensions.height * SCALE / 2 + height / 2; // sits on countertop top

  const geom = new THREE.BoxGeometry(len, height, thick);

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x707070, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // +X
    new THREE.MeshStandardMaterial({ color: 0x707070, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // -X
    new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8, metalness: 0.2 }), // +Y
    new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8, metalness: 0.2 }), // -Y
    new THREE.MeshPhysicalMaterial({ map: texture || undefined, color: texture ? 0xffffff : 0x808080, roughness: Math.max(0.25, materialSettings.roughness), metalness: materialSettings.metalness, clearcoat: 0.15, clearcoatRoughness: 0.6, envMapIntensity: materialSettings.envMapIntensity }), // +Z (front)
    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: materialSettings.roughness, metalness: materialSettings.metalness }), // -Z (back)
  ];

  return (
    <mesh ref={meshRef} position={[0, y, z]} geometry={geom} material={materials} castShadow receiveShadow />
  );
}

function TexturedBacksplash({ textureUrl }: { textureUrl?: string | null }) {
  const tex = useTexture(textureUrl!);
  return <BacksplashMesh texture={tex} />;
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
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    // Improve light energy handling
    // @ts-expect-error legacy flag present in r180
    gl.physicallyCorrectLights = true;
  }, [gl]);
  
  return (
    <>
      {/* Lighting: balanced, natural */}
      <hemisphereLight intensity={0.35 * viewSettings.lightIntensity} groundColor="#3a3a3a" />
      {/* Key light */}
      <directionalLight
        color={0xfff1e0}
        position={[6, 8, 4]}
        intensity={1.1 * viewSettings.lightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* Rim/fill light */}
      <directionalLight
        color={0xdfeaff}
        position={[-7, 5, -6]}
        intensity={0.6 * viewSettings.lightIntensity}
      />
      
      {/* Environment for reflections */}
      <Environment preset="apartment" />
      
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

      {/* Countertop & Backsplash */}
      <Suspense fallback={null}>
        {appliedTextures.countertop ? (
          <TexturedCountertop textureUrl={appliedTextures.countertop} />
        ) : (
          <CountertopMesh texture={null} />
        )}
        {appliedTextures.backsplash ? (
          <TexturedBacksplash textureUrl={appliedTextures.backsplash} />
        ) : (
          <BacksplashMesh texture={null} />
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
      {/* Soft contact shadows for grounding */}
      <ContactShadows 
        position={[0, -(islandDimensions.height * SCALE) / 2 - 0.005, 0]}
        opacity={0.35}
        width={10}
        height={10}
        blur={2.5}
        far={8}
        resolution={1024}
        frames={1}
      />
      
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
        target={cameraSettings.target}
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
