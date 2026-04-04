import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Edges } from '@react-three/drei';

function Cube() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.05, 0.05]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial 
            color="#000000"
            transmission={0.9} 
            thickness={1}
            roughness={0.1}
            transparent
            opacity={0.8}
        />
        <Edges
          linewidth={2}
          threshold={15}
          color="#D2E75F"
        />
      </mesh>
    </Float>
  );
}

export function FloatingCube({ className }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) return <div className={className} />;

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4] }} alpha>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Cube />
      </Canvas>
    </div>
  );
}
