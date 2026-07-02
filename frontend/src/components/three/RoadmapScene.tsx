"use client";

import { useMemo, useRef, useState, useEffect, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, ContactShadows, Html, Float } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import type { CheckpointSummary } from "@/lib/types";

/** Normalised positions of the 4 stations along the road curve. */
const STOPS = [0.1, 0.37, 0.63, 0.9];

/** The winding elevated road (a gentle S through the city). */
function useRoadCurve() {
  return useMemo(() => {
    const pts = [
      new THREE.Vector3(-15, 0.6, 14),
      new THREE.Vector3(-9, 0.6, 8),
      new THREE.Vector3(-11, 0.6, 1),
      new THREE.Vector3(-3, 0.6, -3),
      new THREE.Vector3(4, 0.6, -1),
      new THREE.Vector3(6, 0.6, -8),
      new THREE.Vector3(13, 0.6, -11),
      new THREE.Vector3(17, 0.6, -18),
    ];
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }, []);
}

function Road({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 260, 1.15, 14, false), [curve]);
  const centreGeom = useMemo(() => new THREE.TubeGeometry(curve, 260, 0.07, 6, false), [curve]);
  // Pillars supporting the viaduct.
  const pillars = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) out.push(curve.getPointAt(i / 14));
    return out;
  }, [curve]);
  return (
    <group>
      <mesh geometry={geom} scale={[1, 0.16, 1]} castShadow receiveShadow>
        <meshStandardMaterial color="#e4d9c6" roughness={0.9} metalness={0} />
      </mesh>
      {/* centre line */}
      <mesh geometry={centreGeom} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#f6efe1" roughness={1} />
      </mesh>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, p.y / 2 - 0.1, p.z]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, p.y + 0.3, 10]} />
          <meshStandardMaterial color="#d8ccb8" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

const BUILDING_COLORS = ["#cfe0f2", "#dcead0", "#e8d3c6", "#dcd3ee", "#cfe6da", "#f0e6d4"];

function City({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const buildings = useMemo(() => {
    const items: { pos: [number, number, number]; h: number; w: number; d: number; color: string }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 26; i++) {
      const t = (i + 0.5) / 26;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
      const dir = i % 2 === 0 ? 1 : -1;
      const dist = 4 + rnd() * 5;
      const h = 1.6 + rnd() * 5;
      const bx = p.x + side.x * dist * dir + (rnd() - 0.5) * 2;
      const bz = p.z + side.z * dist * dir + (rnd() - 0.5) * 2;
      items.push({ pos: [bx, h / 2, bz], h, w: 1.2 + rnd() * 1.4, d: 1.2 + rnd() * 1.4, color: BUILDING_COLORS[i % BUILDING_COLORS.length] });
    }
    return items;
  }, [curve]);

  const trees = useMemo(() => {
    const items: [number, number, number][] = [];
    let seed = 42;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 20; i++) {
      const t = (i + 0.2) / 20;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
      const dir = i % 2 === 0 ? -1 : 1;
      const dist = 2.4 + rnd() * 2.5;
      items.push([p.x + side.x * dist * dir, 0, p.z + side.z * dist * dir]);
    }
    return items;
  }, [curve]);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} roughness={0.85} />
        </mesh>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={t}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
            <meshStandardMaterial color="#b89a6f" roughness={1} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <coneGeometry args={[0.5, 1.1, 8]} />
            <meshStandardMaterial color="#93b892" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CompletionParticles({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ a: (i / 8) * Math.PI * 2, r: 0.5 + (i % 3) * 0.25, s: 0.6 + (i % 4) * 0.2 })), []);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((c, i) => {
      const s = seeds[i];
      c.position.y = ((t * s.s + i) % 3) - 0.3;
      c.position.x = Math.cos(s.a + t * 0.3) * s.r;
      c.position.z = Math.sin(s.a + t * 0.3) * s.r;
    });
  });
  return (
    <group ref={ref}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Station({
  point,
  cp,
  index,
  active,
  onSelect,
}: {
  point: THREE.Vector3;
  cp: CheckpointSummary;
  index: number;
  active: boolean;
  onSelect: (i: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const haloRef = useRef<THREE.Mesh>(null);
  const locked = cp.status === "empty";
  const completed = cp.completed;
  const color = new THREE.Color(cp.accent);
  const dim = locked ? 0.4 : 1;

  useFrame((state) => {
    if (!haloRef.current) return;
    const base = completed ? 0.55 : active ? 0.4 : 0.22;
    const pulse = active || completed ? 0.12 * Math.sin(state.clock.elapsedTime * 2) : 0;
    const mat = haloRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (base + pulse) * dim;
    haloRef.current.scale.setScalar(hovered ? 1.15 : 1);
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hovered]);

  return (
    <group
      position={[point.x, point.y, point.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(index); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Portico: two pillars + arch */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]} castShadow>
          <boxGeometry args={[0.22, 1.8, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent opacity={dim} />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[2.2, 0.24, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={completed ? 0.5 : active ? 0.3 : 0.08} transparent opacity={dim} />
      </mesh>
      {/* Soft halo */}
      <mesh ref={haloRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.6, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
      {completed && <group position={[0, 1, 0]}><CompletionParticles color={cp.accent} /></group>}

      {/* Number disc */}
      <Float speed={active ? 2 : 1} rotationIntensity={0} floatIntensity={active ? 0.4 : 0.15}>
        <Html position={[0, 2.7, 0]} center distanceFactor={12} occlude={false}>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(index); }}
            className="roadmap-badge"
            style={{ "--acc": cp.accent, opacity: locked ? 0.65 : 1 } as CSSProperties}
          >
            <span className="roadmap-badge-num">{cp.order}</span>
            <span className="roadmap-badge-title">{cp.title}</span>
            <span className="roadmap-badge-state">
              {locked ? "Bientôt" : completed ? "Terminé ✓" : "En cours"}
            </span>
          </button>
        </Html>
      </Float>
    </group>
  );
}

function CameraRig({ curve, activeIndex }: { curve: THREE.CatmullRomCurve3; activeIndex: number }) {
  const { camera } = useThree();
  const progress = useRef({ t: STOPS[activeIndex] ?? 0.1 });
  const tmp = useMemo(() => ({ point: new THREE.Vector3(), tan: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useEffect(() => {
    const target = STOPS[activeIndex] ?? 0.1;
    const tween = gsap.to(progress.current, { t: target, duration: 2.2, ease: "power2.inOut" });
    return () => { tween.kill(); };
  }, [activeIndex]);

  useFrame((state) => {
    const t = THREE.MathUtils.clamp(progress.current.t, 0.001, 0.999);
    curve.getPointAt(t, tmp.point);
    curve.getTangentAt(t, tmp.tan);
    const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.4;
    // Trail behind + above the station for a gentle top-down travelling.
    camera.position.lerp(
      new THREE.Vector3(
        tmp.point.x - tmp.tan.x * 7 + sway,
        tmp.point.y + 5.2,
        tmp.point.z - tmp.tan.z * 7 + 2
      ),
      0.06
    );
    tmp.look.set(tmp.point.x + tmp.tan.x * 2, tmp.point.y + 0.8, tmp.point.z + tmp.tan.z * 2);
    camera.lookAt(tmp.look);
  });
  return null;
}

export default function RoadmapScene({
  checkpoints,
  activeIndex,
  onSelect,
}: {
  checkpoints: CheckpointSummary[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const curve = useRoadCurve();
  const stationPoints = useMemo(() => STOPS.map((t) => curve.getPointAt(t)), [curve]);

  return (
    <Canvas shadows dpr={[1, 1.8]} camera={{ position: [-18, 8, 18], fov: 42 }} gl={{ antialias: true }}>
      <Sky sunPosition={[-8, 3, -10]} turbidity={6} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={["#e9edf4", 26, 60]} />
      <hemisphereLight args={["#fdf6ea", "#c8d6c6", 1.1]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-10, 12, -6]}
        intensity={1.6}
        color="#ffe9c8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#d9e4d2" roughness={1} />
      </mesh>

      <Road curve={curve} />
      <City curve={curve} />

      {checkpoints.slice(0, 4).map((cp, i) => (
        <Station key={cp.slug} point={stationPoints[i]} cp={cp} index={i} active={i === activeIndex} onSelect={onSelect} />
      ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.28} scale={70} blur={2.5} far={12} color="#4a5a6a" />
      <CameraRig curve={curve} activeIndex={activeIndex} />
    </Canvas>
  );
}
