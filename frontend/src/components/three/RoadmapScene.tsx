"use client";

import { useMemo, useRef, useState, useEffect, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, ContactShadows, Html, Float, Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import type { CheckpointSummary } from "@/lib/types";
import { EffectComposer, Bloom, Vignette, HueSaturation, BrightnessContrast } from "@react-three/postprocessing";
import { CityCrowd, TreesInstanced, SecondaryRoad, GroundTraffic, StreetLife, HorizonSilhouettes, useGroundLoop } from "./cityExtras";

const UP = new THREE.Vector3(0, 1, 0);

/** Evenly spread N stations along the curve (0.08 → 0.92). */
function useStops(count: number) {
  return useMemo(() => {
    if (count <= 1) return [0.5];
    return Array.from({ length: count }, (_, i) => 0.08 + (i / (count - 1)) * 0.84);
  }, [count]);
}

/** The winding elevated road (a gentle S through the city). */
function useRoadCurve() {
  return useMemo(() => {
    const pts = [
      new THREE.Vector3(-16, 0.6, 15),
      new THREE.Vector3(-9, 0.6, 8),
      new THREE.Vector3(-11, 0.6, 1),
      new THREE.Vector3(-3, 0.6, -3),
      new THREE.Vector3(4, 0.6, -1),
      new THREE.Vector3(6, 0.6, -8),
      new THREE.Vector3(13, 0.6, -11),
      new THREE.Vector3(18, 0.6, -19),
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

/** Soft street-grid ground texture — reads as tidy city blocks from above. */
function useGroundTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#dbe6d4";
    ctx.fillRect(0, 0, 256, 256);
    // soft organic blotches — breaks flat colour before the street grid
    let s = 13;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = i % 2 ? "rgba(232,240,222,0.20)" : "rgba(205,220,196,0.20)";
      ctx.beginPath();
      ctx.arc(rnd() * 256, rnd() * 256, 9 + rnd() * 22, 0, Math.PI * 2);
      ctx.fill();
    }
    // subtle alternating blocks
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        if ((x + y) % 2 === 0) ctx.fillRect(x * 64 + 5, y * 64 + 5, 54, 54);
    // streets
    ctx.strokeStyle = "rgba(190,205,190,0.9)";
    ctx.lineWidth = 5;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * 64); ctx.lineTo(256, i * 64); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }, []);
}

const BUILDING_COLORS = ["#cfe0f2", "#dcead0", "#e8d3c6", "#dcd3ee", "#cfe6da", "#f0e6d4", "#e6dcef"];
const ROOF_COLORS = ["#b9c9de", "#c6d5b7", "#d6bda9", "#c3b7de"];
const GLASS_COLORS = ["#bcd8ee", "#c9e4e2", "#d4d3ef"];

type BuildingKind = "block" | "glass" | "landmark";

function City({ curve, stationPts }: { curve: THREE.CatmullRomCurve3; stationPts: THREE.Vector3[] }) {
  const winCanvas = useWindowCanvas();

  const buildings = useMemo(() => {
    const items: {
      kind: BuildingKind;
      pos: [number, number, number];
      h: number; w: number; d: number;
      color: string; roof: string; tex: THREE.CanvasTexture | null;
    }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    // ground track of the trailing camera — keep roofs out from under the lens
    const trail: THREE.Vector3[] = [];
    for (let i = 0; i <= 63; i++) {
      const tt = THREE.MathUtils.clamp(i / 63, 0.001, 0.999);
      const pp = curve.getPointAt(tt);
      const tn = curve.getTangentAt(tt);
      trail.push(new THREE.Vector3(pp.x - tn.x * 8.6, 0, pp.z - tn.z * 8.6 + 2));
    }
    for (let i = 0; i < 46; i++) {
      const t = (i + 0.5) / 46;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = i % 2 === 0 ? 1 : -1;
      const dist = 3.6 + rnd() * 7;
      const kindRoll = rnd();
      // no "landmark" heroes anymore: a tall grey cone beside the camera path
      // dominated the frame — the instanced crowd now carries the variety.
      let kind: BuildingKind = kindRoll > 0.58 ? "glass" : "block";
      let h = kind === "glass" ? 2.6 + rnd() * 2.2 : 1.4 + rnd() * 3.4;
      const w = 1.1 + rnd() * 1.5;
      const d = 1.1 + rnd() * 1.5;
      const bx = p.x + side.x * dist * dir + (rnd() - 0.5) * 2.4;
      const bz = p.z + side.z * dist * dir + (rnd() - 0.5) * 2.4;
      // Keep every station platform clear: no building near a checkpoint.
      if (stationPts.some((sp) => (sp.x - bx) ** 2 + (sp.z - bz) ** 2 < 6 ** 2)) continue;
      // Never under or right beside the lens itself.
      const trailD2 = Math.min(...trail.map((s) => (s.x - bx) ** 2 + (s.z - bz) ** 2));
      if (trailD2 < 3 * 3) continue;
      if (trailD2 < 6.5 * 6.5) {
        kind = "block";
        h = Math.min(h, 2.2);
      }
      // Low-rise corridor along the road so stations stay visible while travelling.
      if (dist < 6.2) {
        kind = "block";
        h = Math.min(h, 2.6);
      } else if (h > 4.2) {
        // The camera trails ~9u behind the road: heroes this close must never
        // tower into the lens (the "giant grey pillar" bug).
        h = 4.2;
      }
      let tex: THREE.CanvasTexture | null = null;
      if (kind === "block") {
        tex = new THREE.CanvasTexture(winCanvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(Math.max(1, Math.round(w)), Math.max(1, Math.round(h * 0.9)));
        tex.needsUpdate = true;
      }
      items.push({
        kind,
        pos: [bx, h / 2, bz], h, w, d,
        color: kind === "glass" ? GLASS_COLORS[i % GLASS_COLORS.length] : BUILDING_COLORS[i % BUILDING_COLORS.length],
        roof: ROOF_COLORS[i % ROOF_COLORS.length],
        tex,
      });
    }
    return items;
  }, [curve, winCanvas, stationPts]);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {b.kind === "glass" ? (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[b.w, b.h, b.d]} />
                <meshPhysicalMaterial
                  color={b.color} metalness={0.15} roughness={0.14}
                  clearcoat={1} clearcoatRoughness={0.25} transparent opacity={0.88}
                />
              </mesh>
              {/* vertical accent fins */}
              <mesh position={[0, 0, b.d / 2 + 0.02]}>
                <boxGeometry args={[b.w * 0.86, b.h * 0.94, 0.03]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} transparent opacity={0.35} />
              </mesh>
              <mesh position={[0, b.h / 2 + 0.05, 0]}>
                <boxGeometry args={[b.w * 0.7, 0.1, b.d * 0.7]} />
                <meshStandardMaterial color="#eef4fa" roughness={0.6} />
              </mesh>
            </>
          ) : b.kind === "landmark" ? (
            <>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[b.w * 0.55, b.w * 0.8, b.h, 8]} />
                <meshPhysicalMaterial color={b.color} metalness={0.2} roughness={0.3} clearcoat={0.6} />
              </mesh>
              {/* crown ring + antenna */}
              <mesh position={[0, b.h / 2 + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[b.w * 0.5, 0.05, 8, 24]} />
                <meshStandardMaterial color="#ffffff" emissive="#cfe4ff" emissiveIntensity={0.7} roughness={0.4} />
              </mesh>
              <mesh position={[0, b.h / 2 + 0.65, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 1.1, 6]} />
                <meshStandardMaterial color="#c8cdd6" roughness={0.5} metalness={0.4} />
              </mesh>
              <mesh position={[0, b.h / 2 + 1.22, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshBasicMaterial color="#ffd98a" toneMapped={false} />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[b.w, b.h, b.d]} />
                <meshStandardMaterial color={b.color} map={b.tex ?? undefined} roughness={0.75} />
              </mesh>
              <mesh position={[0, b.h / 2 + 0.06, 0]} castShadow>
                <boxGeometry args={[b.w + 0.12, 0.14, b.d + 0.12]} />
                <meshStandardMaterial color={b.roof} roughness={0.9} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/** Slim modern light poles with soft warm glow. */
function Lamps({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const lamps = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.5) / 10;
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
            <cylinderGeometry args={[0.03, 0.045, 1.4, 6]} />
            <meshStandardMaterial color="#c8cdd6" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.34, 0]}>
            <boxGeometry args={[0.26, 0.035, 0.05]} />
            <meshStandardMaterial color="#c8cdd6" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.44, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 4, 8]} />
            <meshStandardMaterial color="#fff4d6" emissive="#ffd98a" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const CAR_COLORS = ["#e0956f", "#5e97d6", "#9b8ccb", "#86b08a", "#e8b04b", "#5fb3c6"];

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

/** A sleek hover-shuttle gliding above the road — the futuristic signature. */
function Shuttle({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const state = useRef({ t: 0.35 });
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), tan: new THREE.Vector3() }), []);
  useFrame((s, delta) => {
    state.current.t = (state.current.t + delta * 0.012) % 1;
    const t = THREE.MathUtils.clamp(state.current.t, 0.001, 0.999);
    if (!ref.current) return;
    curve.getPointAt(t, tmp.p);
    curve.getTangentAt(t, tmp.tan);
    const bob = Math.sin(s.clock.elapsedTime * 1.4) * 0.12;
    ref.current.position.set(tmp.p.x, tmp.p.y + 2.6 + bob, tmp.p.z);
    ref.current.lookAt(tmp.p.x + tmp.tan.x, tmp.p.y + 2.6 + bob, tmp.p.z + tmp.tan.z);
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(s.clock.elapsedTime * 3) * 0.12;
    }
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <capsuleGeometry args={[0.16, 0.7, 4, 12]} />
        <meshPhysicalMaterial color="#f2f6fb" metalness={0.35} roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.1, 0.5, 4, 10]} />
        <meshPhysicalMaterial color="#bcd8ee" metalness={0.2} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* under-glow */}
      <mesh ref={glowRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 20]} />
        <meshBasicMaterial color="#9fc6e8" transparent opacity={0.4} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Soft floating "data orbs" — gentle ambient life above the city. */
function DataOrbs() {
  const orbs = useMemo(
    () => [
      { pos: [-10, 5.4, 6], c: "#a8cbe8", s: 0.22 }, { pos: [2, 6.8, -5], c: "#c4b7e6", s: 0.18 },
      { pos: [10, 5, -12], c: "#9fd0c3", s: 0.2 }, { pos: [-4, 7.4, -1], c: "#f0c9a8", s: 0.16 },
      { pos: [15, 6.4, -16], c: "#a8cbe8", s: 0.18 }, { pos: [-13, 6, 11], c: "#9fd0c3", s: 0.17 },
    ] as { pos: [number, number, number]; c: string; s: number }[],
    []
  );
  return (
    <group>
      {orbs.map((o, i) => (
        <Float key={i} speed={1.2 + (i % 3) * 0.4} rotationIntensity={0} floatIntensity={1.6}>
          <mesh position={o.pos}>
            <icosahedronGeometry args={[o.s, 1]} />
            <meshStandardMaterial color={o.c} emissive={o.c} emissiveIntensity={0.55} roughness={0.3} transparent opacity={0.9} />
          </mesh>
        </Float>
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
  const edgeGeom = useMemo(() => new THREE.TubeGeometry(curve, 260, 1.18, 14, false), [curve]);
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
      {/* luminous guide edge — subtle futuristic rim */}
      <mesh geometry={edgeGeom} scale={[1, 0.05, 1]} position={[0, 0.16, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#dceafc" emissiveIntensity={0.5} roughness={0.6} transparent opacity={0.65} />
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

/** Soft holographic arches between stations — waypoints on the route. */
function EnergyGates({ curve, stops }: { curve: THREE.CatmullRomCurve3; stops: number[] }) {
  const gates = useMemo(() => {
    const out: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const t = (stops[i] + stops[i + 1]) / 2;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      out.push({ pos: p, look: p.clone().add(tan) });
    }
    return out;
  }, [curve, stops]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((s) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.22 + Math.sin(s.clock.elapsedTime * 1.2 + i * 1.7) * 0.08;
    });
  });
  return (
    <group>
      {gates.map((g, i) => (
        <group key={i} position={g.pos} onUpdate={(self) => self.lookAt(g.look)}>
          <mesh ref={(el) => { refs.current[i] = el; }} position={[0, 1.1, 0]}>
            <torusGeometry args={[1.5, 0.045, 8, 40]} />
            <meshBasicMaterial color="#9fc6e8" transparent opacity={0.25} toneMapped={false} depthWrite={false} />
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
          <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Station({ point, cp, total, index, active, onSelect }: {
  point: THREE.Vector3; cp: CheckpointSummary; total: number; index: number; active: boolean; onSelect: (i: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const locked = cp.status === "empty";
  const completed = cp.completed;
  const color = useMemo(() => new THREE.Color(cp.accent), [cp.accent]);
  const dim = locked ? 0.42 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const base = completed ? 0.5 : active ? 0.36 : 0.2;
    const pulse = active || completed ? 0.1 * Math.sin(t * 2) : 0;
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = (base + pulse) * dim * 0.55;
      haloRef.current.scale.setScalar(hovered ? 1.12 : 1);
    }
    if (ringRef.current) ringRef.current.rotation.z += 0.004;
    if (gemRef.current) {
      gemRef.current.rotation.y = t * 0.6;
      gemRef.current.position.y = 1.45 + Math.sin(t * 1.6 + index) * 0.08;
    }
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = (active ? 0.16 : 0.08) * dim + Math.sin(t * 1.8 + index) * 0.02;
    }
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
      {/* landing platform */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[1.45, 1.55, 0.09, 36]} />
        <meshPhysicalMaterial color="#fdfdfb" roughness={0.35} clearcoat={0.8} transparent opacity={0.95 * dim} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.32, 1.44, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.5 * dim} toneMapped={false} />
      </mesh>

      {/* tapered pylons */}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.12, 2.1, 10]} />
          <meshPhysicalMaterial color="#f4f6f9" metalness={0.35} roughness={0.3} clearcoat={0.7} transparent opacity={dim} />
        </mesh>
      ))}
      {/* crown halo ring */}
      <mesh position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.08, 0.055, 10, 44]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={completed ? 0.85 : active ? 0.9 : 0.18}
          roughness={0.35} transparent opacity={dim}
        />
      </mesh>

      {/* floating gem beacon */}
      <mesh ref={gemRef} position={[0, 1.45, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshPhysicalMaterial
          color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0.22}
          metalness={0.1} roughness={0.2} clearcoat={1} transparent opacity={Math.max(0.55, dim)}
        />
      </mesh>

      {/* soft light beam */}
      <mesh ref={beamRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.95, 2.9, 20, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* ambient halo */}
      <mesh ref={haloRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.7, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} depthWrite={false} />
      </mesh>

      {/* rotating accent ring for the active station */}
      {active && !locked && (
        <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[2, 0.035, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.75} toneMapped={false} />
        </mesh>
      )}
      {completed && <group position={[0, 1, 0]}><CompletionParticles color={cp.accent} /></group>}

      <Float speed={active ? 2 : 1} rotationIntensity={0} floatIntensity={active ? 0.4 : 0.15}>
        <Html position={[0, 3.1, 0]} center distanceFactor={12} occlude={false}>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(index); }}
            className="roadmap-badge"
            style={{ "--acc": cp.accent, opacity: locked ? 0.72 : 1 } as CSSProperties}
          >
            <span className="roadmap-badge-num">{cp.order}</span>
            <span className="roadmap-badge-title">{cp.title}</span>
            <span className="roadmap-badge-state">{locked ? "Bientôt" : completed ? "Terminé ✓" : `Étape ${cp.order}/${total}`}</span>
          </button>
        </Html>
      </Float>
    </group>
  );
}

/** easeInOutQuart — soft acceleration, soft arrival (three-story-controls style). */
function easeInOutQuart(x: number) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

/**
 * StoryPoints-style rig: each checkpoint change starts a timed, eased
 * transition along the curve (duration scales with distance travelled),
 * with damped position + damped lookAt on top, and a gentle orbital sway
 * that blends in once the camera has arrived.
 */
function CameraRig({ curve, stops, activeIndex }: { curve: THREE.CatmullRomCurve3; stops: number[]; activeIndex: number }) {
  const { camera } = useThree();
  const progress = useRef(stops[activeIndex] ?? 0.1);
  const trans = useRef({ from: 0, to: stops[activeIndex] ?? 0.1, t0: 0, dur: 1, running: false });
  const orbit = useRef(0); // 0 → 1 idle-orbit blend after arrival
  const look = useRef(new THREE.Vector3(0, 0, -1));
  const started = useRef(false);
  const intro = useRef({ v: 0 }); // 0 → 1 establishing fly-in
  const tmp = useMemo(
    () => ({ point: new THREE.Vector3(), tan: new THREE.Vector3(), side: new THREE.Vector3(), pos: new THREE.Vector3(), lookT: new THREE.Vector3() }),
    []
  );

  useEffect(() => {
    gsap.to(intro.current, { v: 1, duration: 2.6, ease: "power2.out" });
  }, []);

  useEffect(() => {
    const to = stops[activeIndex] ?? 0.1;
    trans.current = {
      from: progress.current,
      to,
      t0: performance.now(),
      dur: THREE.MathUtils.clamp(1200 + Math.abs(to - progress.current) * 3200, 1400, 2400),
      running: true,
    };
  }, [activeIndex, stops]);

  useFrame((state, delta) => {
    const tr = trans.current;
    if (tr.running) {
      const e = Math.min(1, (performance.now() - tr.t0) / tr.dur);
      progress.current = tr.from + (tr.to - tr.from) * easeInOutQuart(e);
      if (e >= 1) tr.running = false;
      orbit.current = Math.max(0, orbit.current - delta * 2.5); // fade orbit out fast while travelling
    } else {
      progress.current = tr.to;
      orbit.current = Math.min(1, orbit.current + delta / 1.5); // ease orbit in after arrival
    }

    const t = THREE.MathUtils.clamp(progress.current, 0.001, 0.999);
    curve.getPointAt(t, tmp.point);
    curve.getTangentAt(t, tmp.tan);
    tmp.side.crossVectors(tmp.tan, UP).normalize();

    const el = state.clock.elapsedTime;
    const sway = Math.sin(el * 0.4) * 0.35;
    const orbitOff = Math.sin(el * 0.22) * 1.15 * orbit.current; // slow lateral arc around the active station
    const bob = Math.sin(el * 0.3) * 0.14 * orbit.current;
    const height = THREE.MathUtils.lerp(12.5, 6.4, intro.current.v) + bob;
    const back = THREE.MathUtils.lerp(12, 8.6, intro.current.v);

    tmp.pos.set(
      tmp.point.x - tmp.tan.x * back + tmp.side.x * (sway + orbitOff),
      tmp.point.y + height,
      tmp.point.z - tmp.tan.z * back + tmp.side.z * (sway + orbitOff) + 2
    );
    camera.position.lerp(tmp.pos, 0.07);

    // damped lookAt — no rotational snap when the target station changes
    tmp.lookT.set(tmp.point.x + tmp.tan.x * 2, tmp.point.y + 0.8, tmp.point.z + tmp.tan.z * 2);
    if (!started.current) {
      look.current.copy(tmp.lookT);
      started.current = true;
    }
    look.current.lerp(tmp.lookT, 0.08);
    camera.lookAt(look.current);
  });
  return null;
}

function Ground() {
  const tex = useGroundTexture();
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial map={tex} color="#eef3ea" roughness={1} />
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
    </>
  );
}

export default function RoadmapScene({ checkpoints, activeIndex, onSelect }: {
  checkpoints: CheckpointSummary[]; activeIndex: number; onSelect: (i: number) => void;
}) {
  const curve = useRoadCurve();
  const stops = useStops(checkpoints.length);
  const stationPoints = useMemo(() => stops.map((t) => curve.getPointAt(t)), [curve, stops]);
  const groundLoop = useGroundLoop();

  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-22, 12, 20], fov: 42 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      {/* golden-hour sky, fog pushed back so the city keeps its colour */}
      <Sky sunPosition={[-8, 2.4, -10]} turbidity={5.5} rayleigh={1.7} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={["#e4e8dd", 42, 98]} />
      {/* hemisphere + ambient kept LOW so the warm key actually models the volumes */}
      <hemisphereLight args={["#fdf3e3", "#c9d6c2", 0.8]} />
      <ambientLight intensity={0.2} />
      {/* warm key (only shadow-caster) + cool lavender fill = colour depth */}
      <directionalLight
        position={[-10, 13, -6]} intensity={2.5} color="#ffdfae" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={70} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[12, 8, 10]} intensity={0.4} color="#d8e2f8" />

      <Ground />
      <HorizonSilhouettes curve={curve} />
      <Road curve={curve} />
      <SecondaryRoad loop={groundLoop} />
      <City curve={curve} stationPts={stationPoints} />
      <CityCrowd curve={curve} stationPts={stationPoints} />
      <TreesInstanced curve={curve} stationPts={stationPoints} />
      <StreetLife stationPts={stationPoints} />
      <Lamps curve={curve} />
      <Cars curve={curve} />
      <GroundTraffic loop={groundLoop} />
      <Shuttle curve={curve} />
      <EnergyGates curve={curve} stops={stops} />
      <DataOrbs />
      <Clouds />
      <Sparkles count={40} scale={[50, 12, 50]} position={[0, 7, -2]} size={1.6} speed={0.25} opacity={0.5} color="#fff6e4" />

      {checkpoints.map((cp, i) => (
        <Station key={cp.slug} point={stationPoints[i]} cp={cp} total={checkpoints.length} index={i} active={i === activeIndex} onSelect={onSelect} />
      ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.26} scale={80} blur={2.6} far={14} color="#4a5a6a" />
      <CameraRig curve={curve} stops={stops} activeIndex={activeIndex} />

      {/* subtle post — bloom on emissive accents, gentle grade, vignette depth */}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
        <HueSaturation saturation={0.16} />
        <BrightnessContrast brightness={0.015} contrast={0.08} />
        <Vignette eskil={false} offset={0.18} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
