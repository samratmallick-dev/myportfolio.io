import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

const AbstractShape = () => {
      const meshRef = useRef();

      useFrame((state) => {
            if (meshRef.current) {
                  meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
                  meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            }
      });

      return (
            <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                  <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
                        <MeshDistortMaterial 
                              color="#3b82f6" 
                              attach="material" 
                              distort={0.4} 
                              speed={2} 
                              roughness={0.2}
                              metalness={0.8}
                        />
                  </Sphere>
            </Float>
      );
};

const Hero3D = () => {
      return (
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4338ca" />
                        <AbstractShape />
                        {/* OrbitControls disabled for background element to not interfere with scrolling */}
                  </Canvas>
            </div>
      );
};

export default React.memo(Hero3D);
