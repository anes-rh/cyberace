"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";
import * as THREE from "three";

const CYAN = new THREE.Color("#22d3ee");
const VIOLET = new THREE.Color("#8b5cf6");
const MAGENTA = new THREE.Color("#f0398b");

/** Fibonacci-sphere node positions with nearest-neighbour edges. */
function useNetwork(count: number, radius: number, neighbors: number) {
  return useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const offset = 2 / count;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * increment;
      nodes.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(radius));
    }

    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      const dists = nodes
        .map((n, j) => ({ j, d: nodes[i].distanceTo(n) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, neighbors);
      for (const { j } of dists) {
        if (i < j) positions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
    return { nodes, edgePositions: new Float32Array(positions) };
  }, [count, radius, neighbors]);
}

export function NetworkGlobe({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const instRef = useRef<THREE.InstancedMesh>(null);
  const { nodes, edgePositions } = useNetwork(150, 2.2, 3);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const mesh = instRef.current;
    if (!mesh) return;
    nodes.forEach((n, i) => {
      dummy.position.copy(n);
      dummy.scale.setScalar(0.6 + Math.random() * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const c = i % 3 === 0 ? MAGENTA : i % 2 === 0 ? VIOLET : CYAN;
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes, dummy]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Autonomous slow spin.
    g.rotation.y += delta * 0.12;
    // Pointer parallax (eased) + scroll-driven tilt.
    const px = state.pointer.x * 0.5;
    const py = state.pointer.y * 0.4;
    const scrollTilt = scrollRef.current * 0.9;
    g.rotation.x += (py + scrollTilt - g.rotation.x) * 0.05;
    g.rotation.z += (-px * 0.4 - g.rotation.z) * 0.05;
    const targetScale = 1 - scrollRef.current * 0.15;
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.06);
  });

  return (
    <group ref={group}>
      <instancedMesh ref={instRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>

      <Icosahedron args={[1.15, 1]}>
        <meshStandardMaterial
          color="#0b1830"
          emissive="#22d3ee"
          emissiveIntensity={0.35}
          wireframe
          transparent
          opacity={0.5}
        />
      </Icosahedron>
    </group>
  );
}
