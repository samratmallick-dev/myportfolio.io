import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

const AbstractShape = () => {
      const meshRef = useRef();

      useFrame((state, delta) => {
            if (!meshRef.current) return;
            // Frame-rate independent rotation.
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
      });

      return (
            <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                  {/* 32x32 segments are visually sufficient for a background blob
                      and cut geometry/vertex work by ~75% versus 64x64. */}
                  <Sphere ref={meshRef} args={[1, 32, 32]} scale={1.5}>
                        <MeshDistortMaterial
                              color="#3b82f6"
                              attach="material"
                              distort={0.35}
                              speed={2}
                              roughness={0.2}
                              metalness={0.8}
                        />
                  </Sphere>
            </Float>
      );
};

const Hero3D = () => {
      const containerRef = useRef(null);
      const [inViewport, setInViewport] = useState(true);
      const [documentVisible, setDocumentVisible] = useState(
            typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
      );

      useEffect(() => {
            const element = containerRef.current;
            if (!element || typeof IntersectionObserver === 'undefined') return;

            const observer = new IntersectionObserver(
                  ([entry]) => setInViewport(!!entry?.isIntersecting),
                  { threshold: 0.01 }
            );

            observer.observe(element);
            return () => observer.disconnect();
      }, []);

      useEffect(() => {
            const onVisibilityChange = () => setDocumentVisible(document.visibilityState !== 'hidden');
            document.addEventListener('visibilitychange', onVisibilityChange);
            return () => document.removeEventListener('visibilitychange', onVisibilityChange);
      }, []);

      const active = inViewport && documentVisible;

      return (
            <div
                  ref={containerRef}
                  className="hero-3d absolute inset-0 z-0 pointer-events-none"
                  aria-hidden="true"
            >
                  <Canvas
                        camera={{ position: [0, 0, 5], fov: 45 }}
                        dpr={[1, 1.5]}
                        frameloop={active ? 'always' : 'never'}
                        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                  >
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4338ca" />
                        <AbstractShape />
                  </Canvas>
            </div>
      );
};

export default React.memo(Hero3D);
