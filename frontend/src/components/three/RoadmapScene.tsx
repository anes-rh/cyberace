"use client";

import { useMemo, useRef, useState, useEffect, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, ContactShadows, Html, Float } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import type { CheckpointSummary } from "@/lib/types";

/** Normalised positions of the 4 stations along the road curve. */
const STOPS = [0.1, 0.37, 0.63, 0.9];
const UP = new THREE.Vector3(0, 1, 0);

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

/** Soft window-grid facade texture (daytime glass), reused per building. */
function useWindowCanvas() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "rgba(96,120,150,0.5)";
    const cols = 3, rows = 3, pad = 9, gap = 7;
    const w = (64 - pad * 2 - gap * (cols - 1)) / cols;
    const h = (64 - pad * 2 - gap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++)
      for (let col = 0; col < cols; col++)
        ctx.fillRect(pad + col * (w + gap), pad + r * (h + gap), w, h);
    return c;
  }, []);
}

const BUILDING_COLORS = ["#cfe0f2", "#dcead0", "#e8d3c6", "#dcd3ee", "#cfe6da", "#f0e6d4", "#e6dcef"];
const ROOF_COLORS = ["#b9c9de", "#c6d5b7", "#d6bda9", "#c3b7de"];

function City({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const winCanvas = useWindowCanvas();

  const buildings = useMemo(() => {
    const items: {
      pos: [number, number, number];
      h: number; w: number; d: number;
      color: string; roof: string; tex: THREE.CanvasTexture;
    }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 32; i++) {
      const t = (i + 0.5) / 32;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = i % 2 === 0 ? 1 : -1;
      const dist = 3.6 + rnd() * 6;
      const h = 1.4 + rnd() * 5.5;
      const w = 1.1 + rnd() * 1.5;
      const d = 1.1 + rnd() * 1.5;
      const bx = p.x + side.x * dist * dir + (rnd() - 0.5) * 2.4;
      const bz = p.z + side.z * dist * dir + (rnd() - 0.5) * 2.4;
      const tex = new THREE.CanvasTexture(winCanvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(Math.max(1, Math.round(w)), Math.max(1, Math.round(h * 0.9)));
      tex.needsUpdate = true;
      items.push({
        pos: [bx, h / 2, bz], h, w, d,
        color: BUILDING_COLORS[i % BUILDING_COLORS.length],
        roof: ROOF_COLORS[i % ROOF_COLORS.length],
        tex,
      });
    }
    return items;
  }, [curve, winCanvas]);

  const trees = useMemo(() => {
    const items: { pos: [number, number, number]; s: number; c: string }[] = [];
    let seed = 42;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const greens = ["#93b892", "#a7c79a", "#86ac83"];
    for (let i = 0; i < 22; i++) {
      const t = (i + 0.2) / 22;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = i % 2 === 0 ? -1 : 1;
      const dist = 2.3 + rnd() * 3;
      items.push({ pos: [p.x + side.x * dist * dir, 0, p.z + side.z * dist * dir], s: 0.8 + rnd() * 0.5, c: greens[i % 3] });
    }
    return items;
  }, [curve]);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.color} map={b.tex} roughness={0.75} />
          </mesh>
          <mesh position={[0, b.h / 2 + 0.06, 0]} castShadow>
            <boxGeometry args={[b.w + 0.12, 0.14, b.d + 0.12]} />
            <meshStandardMaterial color={b.roof} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={t.pos} scale={t.s}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
            <meshStandardMaterial color="#b89a6f" roughness={1} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.55, 10, 10]} />
            <meshStandardMaterial color={t.c} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Warm street lamps along the road. */
function Lamps({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const lamps = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.5) / 9;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = i % 2 === 0 ? 1 : -1;
      out.push({ pos: [p.x + side.x * 1.5 * dir, p.y, p.z + side.z * 1.5 * dir] });
    }
    return out;
  }, [curve]);
  return (
    <group>
      {lamps.map((l, i) => (
        <group key={i} position={l.pos}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 1.4, 6]} />
            <meshStandardMaterial color="#c8cdd6" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, 1.42, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#fff4d6" emissive="#ffd98a" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const CAR_COLORS = ["#e0956f", "#5e97d6", "#9b8ccb", "#86b08a", "#e8b04b"];

/** Little cars cruising along the viaduct. */
function Cars({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const cars = useMemo(
    () => CAR_COLORS.map((c, i) => ({ color: c, t: i / CAR_COLORS.length, speed: 0.018 + (i % 3) * 0.006, dir: i % 2 === 0 ? 1 : -1 })),
    []
  );
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), p2: new THREE.Vector3() }), []);
  useFrame((_s, delta) => {
    cars.forEach((car, i) => {
      const g = refs.current[i];
      if (!g) return;
      car.t = (car.t + car.speed * delta * car.dir + 1) % 1;
      const t = THREE.MathUtils.clamp(car.t, 0.001, 0.999);
      curve.getPointAt(t, tmp.p);
      curve.getTangentAt(t, tmp.p2).multiplyScalar(car.dir);
      const side = new THREE.Vector3().crossVectors(tmp.p2, UP).normalize().multiplyScalar(0.35);
      g.position.set(tmp.p.x + side.x, tmp.p.y + 0.28, tmp.p.z + side.z);
      g.lookAt(tmp.p.x + tmp.p2.x, tmp.p.y + 0.28, tmp.p.z + tmp.p2.z);
    });
  });
  return (
    <group>
      {cars.map((car, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.18, 0.6]} />
            <meshStandardMaterial color={car.color} roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.15, -0.02]} castShadow>
            <boxGeometry args={[0.28, 0.16, 0.32]} />
            <meshStandardMaterial color="#f3f6fb" roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Soft drifting clouds (lightweight sphere clusters). */
function Clouds() {
  const ref = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const groups: { pos: [number, number, number]; parts: [number, number, number, number][] }[] = [];
    const spots: [number, number, number][] = [
      [-14, 12, -8], [10, 14, -14], [0, 15, 4], [18, 11, -2], [-6, 13, 10],
    ];
    spots.forEach(([x, y, z]) => {
      groups.push({
        pos: [x, y, z],
        parts: [
          [0, 0, 0, 1.6], [1.4, -0.2, 0.2, 1.2], [-1.3, -0.1, -0.2, 1.1], [0.4, 0.4, 0.4, 1], [-0.5, 0.3, 0.3, 0.9],
        ],
      });
    });
    return groups;
  }, []);
  useFrame((state) => {
    if (ref.current) ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.03) * 3;
  });
  return (
    <group ref={ref}>
      {puffs.map((g, i) => (
        <group key={i} position={g.pos}>
          {g.parts.map((p, j) => (
            <mesh key={j} position={[p[0], p[1], p[2]]}>
              <sphereGeometry args={[p[3], 12, 12]} />
              <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Road({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 260, 1.15, 14, false), [curve]);
  const centreGeom = useMemo(() => new THREE.TubeGeometry(curve, 260, 0.07, 6, false), [curve]);
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
          <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Station({ point, cp, index, active, onSelect }: {
  point: THREE.Vector3; cp: CheckpointSummary; index: number; active: boolean; onSelect: (i: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const locked = cp.status === "empty";
  const completed = cp.completed;
  const color = useMemo(() => new THREE.Color(cp.accent), [cp.accent]);
  const dim = locked ? 0.42 : 1;

  useFrame((state) => {
    const base = completed ? 0.55 : active ? 0.4 : 0.22;
    const pulse = active || completed ? 0.12 * Math.sin(state.clock.elapsedTime * 2) : 0;
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = (base + pulse) * dim;
      haloRef.current.scale.setScalar(hovered ? 1.15 : 1);
    }
    if (ringRef.current) ringRef.current.rotation.z += 0.004;
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
      {/* base platform */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.7, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.35 * dim} toneMapped={false} />
      </mesh>
      {/* portico */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]} castShadow>
          <boxGeometry args={[0.22, 1.8, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.55} transparent opacity={dim} />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[2.2, 0.24, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.55} emissive={color} emissiveIntensity={completed ? 0.6 : active ? 0.35 : 0.1} transparent opacity={dim} />
      </mesh>
      {/* halo */}
      <mesh ref={haloRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.6, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* rotating accent ring for the active station */}
      {active && !locked && (
        <mesh ref={ringRef} position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.9, 0.03, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      {completed && <group position={[0, 1, 0]}><CompletionParticles color={cp.accent} /></group>}

      <Float speed={active ? 2 : 1} rotationIntensity={0} floatIntensity={active ? 0.4 : 0.15}>
        <Html position={[0, 2.7, 0]} center distanceFactor={12} occlude={false}>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(index); }}
            className="roadmap-badge"
            style={{ "--acc": cp.accent, opacity: locked ? 0.7 : 1 } as CSSProperties}
          >
            <span className="roadmap-badge-num">{cp.order}</span>
            <span className="roadmap-badge-title">{cp.title}</span>
            <span className="roadmap-badge-state">{locked ? "Bientôt" : completed ? "Terminé ✓" : "En cours"}</span>
          </button>
        </Html>
      </Float>
    </group>
  );
}

function CameraRig({ curve, activeIndex }: { curve: THREE.CatmullRomCurve3; activeIndex: number }) {
  const { camera } = useThree();
  const progress = useRef({ t: STOPS[activeIndex] ?? 0.1 });
  const intro = useRef({ v: 0 }); // 0 → 1 establishing fly-in
  const tmp = useMemo(() => ({ point: new THREE.Vector3(), tan: new THREE.Vector3(), look: new THREE.Vector3(), pos: new THREE.Vector3() }), []);

  useEffect(() => {
    gsap.to(intro.current, { v: 1, duration: 2.6, ease: "power2.out" });
  }, []);

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
    // establishing height eases from wide/high to the travelling shot
    const height = THREE.MathUtils.lerp(11, 5.2, intro.current.v);
    const back = THREE.MathUtils.lerp(11, 7, intro.current.v);
    tmp.pos.set(tmp.point.x - tmp.tan.x * back + sway, tmp.point.y + height, tmp.point.z - tmp.tan.z * back + 2);
    camera.position.lerp(tmp.pos, 0.06);
    tmp.look.set(tmp.point.x + tmp.tan.x * 2, tmp.point.y + 0.8, tmp.point.z + tmp.tan.z * 2);
    camera.lookAt(tmp.look);
  });
  return null;
}

export default function RoadmapScene({ checkpoints, activeIndex, onSelect }: {
  checkpoints: CheckpointSummary[]; activeIndex: number; onSelect: (i: number) => void;
}) {
  const curve = useRoadCurve();
  const stationPoints = useMemo(() => STOPS.map((t) => curve.getPointAt(t)), [curve]);

  return (
    <Canvas shadows dpr={[1, 1.8]} camera={{ position: [-22, 12, 20], fov: 42 }} gl={{ antialias: true }}>
      <Sky sunPosition={[-8, 3, -10]} turbidity={5} rayleigh={1} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={["#e9edf4", 30, 68]} />
      <hemisphereLight args={["#fdf6ea", "#c8d6c6", 1.15]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[-10, 13, -6]} intensity={1.7} color="#ffe9c8" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-far={70} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34}
      />

      {/* Ground + park patches + pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#d9e4d2" roughness={1} />
      </mesh>
      {[[-8, 6], [9, -6], [2, 12]].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} receiveShadow>
          <circleGeometry args={[3 + i, 24]} />
          <meshStandardMaterial color="#cadcbf" roughness={1} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13, 0.01, -4]}>
        <circleGeometry args={[2.4, 32]} />
        <meshStandardMaterial color="#a9cfe0" roughness={0.3} metalness={0.1} transparent opacity={0.9} />
      </mesh>

      <Road curve={curve} />
      <City curve={curve} />
      <Lamps curve={curve} />
      <Cars curve={curve} />
      <Clouds />

      {checkpoints.slice(0, 4).map((cp, i) => (
        <Station key={cp.slug} point={stationPoints[i]} cp={cp} index={i} active={i === activeIndex} onSelect={onSelect} />
      ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.26} scale={80} blur={2.6} far={14} color="#4a5a6a" />
      <CameraRig curve={curve} activeIndex={activeIndex} />
    </Canvas>
  );
}
