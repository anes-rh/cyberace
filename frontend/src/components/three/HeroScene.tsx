"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { NetworkGlobe } from "./NetworkGlobe";

/**
 * Interactive 3D hero: a cyber-network globe that responds to the pointer
 * and to page scroll. Mount-gated so three never runs during SSR.
 */
export default function HeroScene() {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const vh = window.innerHeight || 1;
      scrollRef.current = Math.min(1, window.scrollY / vh);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 4, 6]} intensity={80} color="#22d3ee" />
      <pointLight position={[-6, -3, 2]} intensity={60} color="#8b5cf6" />
      <pointLight position={[0, 3, -6]} intensity={40} color="#f0398b" />

      <NetworkGlobe scrollRef={scrollRef} />

      <Sparkles count={90} scale={9} size={2.4} speed={0.3} color="#8b5cf6" opacity={0.5} />
      <Sparkles count={60} scale={7} size={1.6} speed={0.2} color="#22d3ee" opacity={0.6} />
    </Canvas>
  );
}
