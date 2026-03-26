import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PositionInfo } from '../hooks/useOrbitData';

// Scale factor to convert KM to Three.js units
const SCALE = 1 / 1500;
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_UNITS = EARTH_RADIUS_KM * SCALE;

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0006;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={15}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.01, 64, 64]} />
        <meshPhongMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SatelliteMarker({ satellite }: { satellite: PositionInfo }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Convert ECI (x,y,z) kilometers to ThreeJS units
  // Notice: ECI Z point to North Pole, X to Vernal Equinox.
  // In Three.js, Y is typically up. We will map ECI Z to ThreeJS Y, ECI Y to ThreeJS Z, ECI X to ThreeJS X.
  const targetPos = new THREE.Vector3(
    satellite.x * SCALE,
    satellite.z * SCALE,
    satellite.y * SCALE
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smooth movement via Lerp towards the streaming target position
      groupRef.current.position.lerp(targetPos, delta * 3);
    }
  });

  let color = '#34d399'; // Safe (emerald)
  let emissiveIntensity = 1;

  if (satellite.status === 'High Risk') {
    color = '#ef4444'; // Red
    emissiveIntensity = 3;
  } else if (satellite.status === 'Medium Risk') {
    color = '#f59e0b'; // Yellow
    emissiveIntensity = 2;
  } else if (satellite.status === 'Low Risk') {
    color = '#3b82f6'; // Blue
    emissiveIntensity = 1.5;
  }

  return (
    <group ref={groupRef} position={targetPos}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={emissiveIntensity} 
        />
      </mesh>
      
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Text
        position={[0, 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineColor="#000"
        outlineWidth={0.02}
      >
        {satellite.name}
      </Text>
    </group>
  );
}

export function ThreeScene({ satellites }: { satellites: PositionInfo[] }) {
  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
      <color attach="background" args={['#010308']} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <pointLight position={[-100, -100, -100]} intensity={0.2} color="#3b82f6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      {satellites.map(sat => (
        <SatelliteMarker key={sat.name} satellite={sat} />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        maxDistance={50}
        minDistance={EARTH_RADIUS_UNITS + 1}
      />
    </Canvas>
  );
}
