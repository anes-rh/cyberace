"use client";

/**
 * Dense-city extras for the roadmap scene — all crowd geometry is instanced
 * (see ~/.claude/3Dskills/r3f-cinematic-city: map3d-style archetypes, one
 * draw call per instanced set). Hero buildings near the road stay in
 * RoadmapScene's City; this module fills the mid/far field.
 */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);

/** Deterministic PRNG so the city never flickers between renders. */
function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

type Spec = {
  pos: [number, number, number];
  scale: [number, number, number];
  rotY?: number;
  euler?: THREE.Euler;
  color: THREE.Color;
};

function applyInstances(mesh: THREE.InstancedMesh | null, specs: Spec[]) {
  if (!mesh) return;
  const dummy = new THREE.Object3D();
  specs.forEach((s, i) => {
    dummy.position.set(s.pos[0], s.pos[1], s.pos[2]);
    if (s.euler) dummy.rotation.copy(s.euler);
    else dummy.rotation.set(0, s.rotY ?? 0, 0);
    dummy.scale.set(s.scale[0], s.scale[1], s.scale[2]);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, s.color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

const PASTELS = ["#cfe0f2", "#dcead0", "#e8d3c6", "#dcd3ee", "#cfe6da", "#f0e6d4", "#e6dcef", "#d8e4ea", "#ead8cd"];
const ROOFS = ["#c8b39e", "#b9c9de", "#c6d5b7", "#c3b7de"];
const GLASS = ["#bcd8ee", "#c9e4e2", "#d4d3ef", "#cfe2f4"];

/** ~150 varied buildings across 8 archetypes → 4 instanced draw calls. */
export function CityCrowd({ curve, stationPts }: { curve: THREE.CatmullRomCurve3; stationPts: THREE.Vector3[] }) {
  const sets = useMemo(() => {
    const rnd = mulberry(20270703);
    const boxes: Spec[] = [];
    const cyls: Spec[] = [];
    const prisms: Spec[] = [];
    const glass: Spec[] = [];
    const jc = (hex: string) =>
      new THREE.Color(hex).offsetHSL((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.09);
    // sampled road polyline — guarantees the viaduct corridor stays clear even
    // where the S-curve folds back on itself
    const samples: THREE.Vector3[] = [];
    for (let i = 0; i <= 63; i++) samples.push(curve.getPointAt(i / 63));
    const clear = (x: number, z: number) =>
      !stationPts.some((sp) => (sp.x - x) ** 2 + (sp.z - z) ** 2 < 8 * 8) &&
      !samples.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 6.5 * 6.5);

    const ring = (count: number, dMin: number, dMax: number, hMin: number, hMax: number, allowTall: boolean) => {
      for (let i = 0; i < count; i++) {
        const t = THREE.MathUtils.clamp(rnd(), 0.001, 0.999);
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const dir = rnd() > 0.5 ? 1 : -1;
        const dist = dMin + rnd() * (dMax - dMin);
        const x = p.x + side.x * dist * dir + (rnd() - 0.5) * 5;
        const z = p.z + side.z * dist * dir + (rnd() - 0.5) * 5;
        if (!clear(x, z)) continue;
        const w = 1 + rnd() * 1.6;
        const d = 1 + rnd() * 1.6;
        let h = hMin + rnd() * (hMax - hMin);
        if (!allowTall) h = Math.min(h, 3.2);
        const rotY = (rnd() - 0.5) * 0.16;
        const y0 = (rnd() - 0.5) * 0.1; // breaks the perfect-grid feel
        const base = PASTELS[Math.floor(rnd() * PASTELS.length)];
        switch (Math.floor(rnd() * 8)) {
          case 0: // slab
            boxes.push({ pos: [x, y0 + h / 2, z], rotY, scale: [w, h, d], color: jc(base) });
            break;
          case 1: // thin tower
            boxes.push({ pos: [x, y0 + h * 0.8, z], rotY, scale: [w * 0.55, h * 1.6, d * 0.55], color: jc(base) });
            break;
          case 2: { // stepped (two shrinking tiers)
            const c = jc(base);
            boxes.push({ pos: [x, y0 + h * 0.3, z], rotY, scale: [w, h * 0.6, d], color: c });
            boxes.push({ pos: [x, y0 + h * 0.6 + h * 0.27, z], rotY, scale: [w * 0.66, h * 0.55, d * 0.66], color: c.clone().offsetHSL(0, 0, 0.03) });
            break;
          }
          case 3: { // podium + tower
            boxes.push({ pos: [x, y0 + h * 0.12, z], rotY, scale: [w * 1.5, h * 0.24, d * 1.5], color: jc(base) });
            boxes.push({ pos: [x, y0 + h * 0.62, z], rotY, scale: [w * 0.5, h, d * 0.5], color: jc(base) });
            break;
          }
          case 4: // drum tower
            cyls.push({ pos: [x, y0 + h / 2, z], rotY, scale: [w * 0.9, h, w * 0.9], color: jc(base) });
            break;
          case 5: { // gable house (box + prism roof)
            const hh = 1.1 + rnd() * 0.7;
            const roofH = 0.55 + rnd() * 0.3;
            boxes.push({ pos: [x, y0 + hh / 2, z], rotY, scale: [w, hh, d], color: jc(base) });
            prisms.push({
              pos: [x, y0 + hh + roofH * 0.5, z],
              euler: new THREE.Euler(-Math.PI / 2, rotY, 0, "YXZ"),
              scale: [w * 0.62, d, roofH],
              color: jc(ROOFS[Math.floor(rnd() * ROOFS.length)]),
            });
            break;
          }
          case 6: // glass tower
            glass.push({ pos: [x, y0 + h * 0.75, z], rotY, scale: [w * 0.8, h * 1.5, d * 0.8], color: jc(GLASS[Math.floor(rnd() * GLASS.length)]) });
            break;
          default: { // crown tower (box + cap)
            const c = jc(base);
            boxes.push({ pos: [x, y0 + h / 2, z], rotY, scale: [w * 0.8, h, d * 0.8], color: c });
            boxes.push({ pos: [x, y0 + h + 0.1, z], rotY, scale: [w * 0.55, 0.2, d * 0.55], color: c.clone().offsetHSL(0, 0, 0.06) });
            break;
          }
        }
      }
    };
    ring(46, 8, 14, 1.6, 5, true);   // mid ring
    ring(58, 14, 26, 2, 8.5, true);  // outer ring — tallest silhouettes
    ring(40, 26, 36, 1.2, 3, false); // far low filler
    return { boxes, cyls, prisms, glass };
  }, [curve, stationPts]);

  const boxRef = useRef<THREE.InstancedMesh>(null);
  const cylRef = useRef<THREE.InstancedMesh>(null);
  const prismRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    applyInstances(boxRef.current, sets.boxes);
    applyInstances(cylRef.current, sets.cyls);
    applyInstances(prismRef.current, sets.prisms);
    applyInstances(glassRef.current, sets.glass);
  }, [sets]);

  return (
    <group>
      <instancedMesh key={`b${sets.boxes.length}`} ref={boxRef} args={[undefined, undefined, sets.boxes.length]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh key={`c${sets.cyls.length}`} ref={cylRef} args={[undefined, undefined, sets.cyls.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <instancedMesh key={`p${sets.prisms.length}`} ref={prismRef} args={[undefined, undefined, sets.prisms.length]}>
        <cylinderGeometry args={[1, 1, 1, 3, 1, false, Math.PI / 2]} />
        <meshStandardMaterial roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh key={`g${sets.glass.length}`} ref={glassRef} args={[undefined, undefined, sets.glass.length]}>
        <boxGeometry />
        <meshPhysicalMaterial roughness={0.15} metalness={0.12} clearcoat={0.9} clearcoatRoughness={0.3} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

const GREENS = ["#93b892", "#a7c79a", "#86ac83", "#9dbf8e", "#b3cf9f"];

/** 120+ trees, 3 shapes (round / bush / conifer) → 3 instanced draw calls. */
export function TreesInstanced({ curve, stationPts }: { curve: THREE.CatmullRomCurve3; stationPts: THREE.Vector3[] }) {
  const sets = useMemo(() => {
    const rnd = mulberry(4242);
    const trunks: Spec[] = [];
    const rounds: Spec[] = [];
    const cones: Spec[] = [];
    const brown = new THREE.Color("#b89a6f");
    const green = () => new THREE.Color(GREENS[Math.floor(rnd() * GREENS.length)]).offsetHSL(0, (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.07);
    const clear = (x: number, z: number, r = 3) =>
      !stationPts.some((sp) => (sp.x - x) ** 2 + (sp.z - z) ** 2 < r * r);

    const add = (x: number, z: number) => {
      if (!clear(x, z)) return;
      const s = 0.75 + rnd() * 0.55;
      const kind = rnd();
      if (kind < 0.45) { // round
        trunks.push({ pos: [x, 0.27 * s, z], scale: [s, s, s], color: brown });
        rounds.push({ pos: [x, 0.92 * s, z], scale: [s, s, s], color: green() });
      } else if (kind < 0.7) { // bush (squashed, no trunk)
        rounds.push({ pos: [x, 0.3 * s, z], scale: [s * 1.35, s * 0.6, s * 1.35], color: green() });
      } else { // conifer
        trunks.push({ pos: [x, 0.27 * s, z], scale: [s, s, s], color: brown });
        cones.push({ pos: [x, 1.05 * s, z], scale: [s, s, s], color: green() });
      }
    };

    // roadside, jittered — never a perfect line
    for (let i = 0; i < 36; i++) {
      const t = Math.min(0.99, (i + rnd() * 0.9) / 36);
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = rnd() > 0.5 ? 1 : -1;
      const dist = 2.2 + rnd() * 3.4;
      add(p.x + side.x * dist * dir + (rnd() - 0.5) * 1.6, p.z + side.z * dist * dir + (rnd() - 0.5) * 1.6);
    }
    // park clusters (match the grass circles in the scene)
    ([[-8, 6], [9, -6], [2, 12]] as const).forEach(([cx, cz]) => {
      for (let i = 0; i < 11; i++) {
        const a = rnd() * Math.PI * 2;
        const r = rnd() * 2.9;
        add(cx + Math.cos(a) * r, cz + Math.sin(a) * r);
      }
    });
    // scattered between the building rings
    for (let i = 0; i < 34; i++) {
      const t = THREE.MathUtils.clamp(rnd(), 0.001, 0.999);
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const dir = rnd() > 0.5 ? 1 : -1;
      const dist = 6.5 + rnd() * 16;
      add(p.x + side.x * dist * dir + (rnd() - 0.5) * 4, p.z + side.z * dist * dir + (rnd() - 0.5) * 4);
    }
    return { trunks, rounds, cones };
  }, [curve, stationPts]);

  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const roundRef = useRef<THREE.InstancedMesh>(null);
  const coneRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    applyInstances(trunkRef.current, sets.trunks);
    applyInstances(roundRef.current, sets.rounds);
    applyInstances(coneRef.current, sets.cones);
  }, [sets]);

  return (
    <group>
      <instancedMesh key={`t${sets.trunks.length}`} ref={trunkRef} args={[undefined, undefined, sets.trunks.length]}>
        <cylinderGeometry args={[0.06, 0.09, 0.55, 6]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh key={`r${sets.rounds.length}`} ref={roundRef} args={[undefined, undefined, sets.rounds.length]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh key={`k${sets.cones.length}`} ref={coneRef} args={[undefined, undefined, sets.cones.length]}>
        <coneGeometry args={[0.42, 1.15, 8]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
    </group>
  );
}

/** Closed ground-level ring road passing under the viaduct. */
export function useGroundLoop() {
  return useMemo(() => {
    const v = (x: number, z: number) => new THREE.Vector3(x, 0.04, z);
    return new THREE.CatmullRomCurve3(
      [v(-20, 10), v(-14, -6), v(-2, -14), v(12, -17), v(20, -6), v(16, 8), v(4, 14), v(-10, 16)],
      true,
      "catmullrom",
      0.6
    );
  }, []);
}

export function SecondaryRoad({ loop }: { loop: THREE.CatmullRomCurve3 }) {
  const geom = useMemo(() => new THREE.TubeGeometry(loop, 220, 0.55, 8, true), [loop]);
  return (
    <mesh geometry={geom} scale={[1, 0.06, 1]} receiveShadow>
      <meshStandardMaterial color="#e6ddcb" roughness={0.95} />
    </mesh>
  );
}

const GROUND_CAR_COLORS = ["#d98f6d", "#6d9fd6", "#a291cf", "#8fb391", "#d9b25e"];

/** Slow, discreet ground traffic on the ring road. */
export function GroundTraffic({ loop }: { loop: THREE.CatmullRomCurve3 }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const cars = useMemo(
    () => GROUND_CAR_COLORS.map((c, i) => ({ color: c, t: i / GROUND_CAR_COLORS.length, speed: 0.008 + (i % 3) * 0.003, dir: i % 2 === 0 ? 1 : -1 })),
    []
  );
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), tan: new THREE.Vector3() }), []);
  useFrame((_s, delta) => {
    cars.forEach((car, i) => {
      const g = refs.current[i];
      if (!g) return;
      car.t = (car.t + car.speed * delta * car.dir + 1) % 1;
      loop.getPointAt(car.t, tmp.p);
      loop.getTangentAt(car.t, tmp.tan).multiplyScalar(car.dir);
      const side = new THREE.Vector3().crossVectors(tmp.tan, UP).normalize().multiplyScalar(0.2);
      g.position.set(tmp.p.x + side.x, 0.16, tmp.p.z + side.z);
      g.lookAt(tmp.p.x + tmp.tan.x, 0.16, tmp.p.z + tmp.tan.z);
    });
  });
  return (
    <group>
      {cars.map((car, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh>
            <boxGeometry args={[0.3, 0.14, 0.52]} />
            <meshStandardMaterial color={car.color} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.12, -0.02]}>
            <boxGeometry args={[0.24, 0.12, 0.28]} />
            <meshStandardMaterial color="#f3f6fb" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const PED_COLORS = ["#e0956f", "#5e97d6", "#9b8ccb", "#86b08a", "#d9a76a", "#7fb5b5"];

/** Benches + stylised pedestrians near each station plaza and the parks. */
export function StreetLife({ stationPts }: { stationPts: THREE.Vector3[] }) {
  const items = useMemo(() => {
    const rnd = mulberry(909);
    const benches: { pos: [number, number, number]; rotY: number }[] = [];
    const peds: { pos: [number, number, number]; c: string; s: number }[] = [];
    stationPts.forEach((sp) => {
      const a = rnd() * Math.PI * 2;
      benches.push({ pos: [sp.x + Math.cos(a) * 2.4, 0, sp.z + Math.sin(a) * 2.4], rotY: a + Math.PI / 2 });
      for (let i = 0; i < 2; i++) {
        const pa = rnd() * Math.PI * 2;
        const pr = 1.9 + rnd() * 1.4;
        peds.push({ pos: [sp.x + Math.cos(pa) * pr, 0, sp.z + Math.sin(pa) * pr], c: PED_COLORS[Math.floor(rnd() * PED_COLORS.length)], s: 0.85 + rnd() * 0.25 });
      }
    });
    ([[-8, 6], [9, -6], [2, 12]] as const).forEach(([cx, cz]) => {
      for (let i = 0; i < 2; i++) {
        const pa = rnd() * Math.PI * 2;
        peds.push({ pos: [cx + Math.cos(pa) * (1 + rnd() * 2), 0, cz + Math.sin(pa) * (1 + rnd() * 2)], c: PED_COLORS[Math.floor(rnd() * PED_COLORS.length)], s: 0.8 + rnd() * 0.3 });
      }
    });
    return { benches, peds };
  }, [stationPts]);

  return (
    <group>
      {items.benches.map((b, i) => (
        <group key={`b${i}`} position={b.pos} rotation={[0, b.rotY, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.7, 0.05, 0.24]} />
            <meshStandardMaterial color="#c9a97e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.38, -0.1]}>
            <boxGeometry args={[0.7, 0.2, 0.04]} />
            <meshStandardMaterial color="#c9a97e" roughness={0.9} />
          </mesh>
          {[-0.28, 0.28].map((x) => (
            <mesh key={x} position={[x, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.2]} />
              <meshStandardMaterial color="#9aa3ad" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {items.peds.map((p, i) => (
        <group key={`p${i}`} position={p.pos} scale={p.s}>
          <mesh position={[0, 0.3, 0]}>
            <capsuleGeometry args={[0.09, 0.26, 4, 8]} />
            <meshStandardMaterial color={p.c} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshStandardMaterial color="#f2d8c0" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
