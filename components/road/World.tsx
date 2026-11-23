"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { STOPS, roadPosition } from "@/lib/stops";

/* ── World palette ──────────────────────────────────────── */
const SKY = "#cde8f7";
const GRASS = "#a9d98c";
const GRASS_DARK = "#8fc873";
const ROAD = "#3b4250";
const CAR = "#ff6a45";

/* ── The road ───────────────────────────────────────────── */
const PTS: [number, number][] = [
  [-6, 10], [1, -4], [-4, -22], [8, -38], [24, -43], [34, -59], [26, -77], [38, -93], [54, -98], [62, -114], [58, -132],
];
const CURVE = new THREE.CatmullRomCurve3(PTS.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "catmullrom", 0.5);
const LEN = CURVE.getLength();
const UP = new THREE.Vector3(0, 1, 0);

const leftOf = (t: THREE.Vector3) => new THREE.Vector3(t.z, 0, -t.x).normalize();

/** Building sites: beside the road at each stop, on the left. */
const SITES = STOPS.map((s) => {
  const p = CURVE.getPointAt(s.u);
  const t = CURVE.getTangentAt(s.u);
  const l = leftOf(t);
  return {
    building: p.clone().add(l.clone().multiplyScalar(8)),
    sign: p.clone().add(l.clone().multiplyScalar(3.4)).add(t.clone().multiplyScalar(-2.5)),
    tangent: t,
    road: p,
  };
});

/* Seeded random so the world is the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function fonts() {
  const s = getComputedStyle(document.documentElement);
  return {
    display: s.getPropertyValue("--font-display").trim() || "sans-serif",
    mono: s.getPropertyValue("--font-mono").trim() || "monospace",
  };
}

function signTexture(name: string, color: string) {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 200;
  const g = cv.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 200);
  g.fillStyle = "rgba(255,255,255,0.22)";
  g.fillRect(0, 160, 512, 40);
  g.fillStyle = "#14202e";
  g.font = `800 92px ${fonts().display}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(name, 256, 88);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function linesTexture(bg: string, ink: string, rows: number, code = false) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 256);
  const r = rng(rows * 7 + (code ? 3 : 1));
  for (let i = 0; i < rows; i++) {
    const indent = code ? [0, 1, 1, 2, 2, 1, 0, 1, 2, 1][i % 10] * 22 : 0;
    g.fillStyle = code ? ["#ff8a65", "#7fd1ff", "#b6f09c", "#ffd166"][i % 4] : ink;
    g.globalAlpha = code ? 0.95 : 0.55;
    g.fillRect(22 + indent, 26 + i * (210 / rows), 60 + r() * (150 - indent), code ? 9 : 8);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── Static scenery ─────────────────────────────────────── */
function Road() {
  const { ribbon, dashes } = useMemo(() => {
    const N = 600;
    const pos: number[] = [];
    const idx: number[] = [];
    const W = 1.9;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const p = CURVE.getPointAt(u);
      const l = leftOf(CURVE.getTangentAt(u));
      pos.push(p.x + l.x * W, 0.02, p.z + l.z * W, p.x - l.x * W, 0.02, p.z - l.z * W);
      if (i < N) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const ribbon = new THREE.BufferGeometry();
    ribbon.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    ribbon.setIndex(idx);
    ribbon.computeVertexNormals();

    const count = Math.floor(LEN / 3);
    const dashes: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const u = (i + 0.5) / count;
      const p = CURVE.getPointAt(u);
      const t = CURVE.getTangentAt(u);
      q.setFromAxisAngle(UP, Math.atan2(t.x, t.z));
      dashes.push(new THREE.Matrix4().compose(new THREE.Vector3(p.x, 0.04, p.z), q, new THREE.Vector3(1, 1, 1)));
    }
    return { ribbon, dashes };
  }, []);

  const dashRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    dashes.forEach((m, i) => dashRef.current?.setMatrixAt(i, m));
    if (dashRef.current) dashRef.current.instanceMatrix.needsUpdate = true;
  }, [dashes]);

  return (
    <>
      <mesh geometry={ribbon} receiveShadow>
        <meshStandardMaterial color={ROAD} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]}>
        <boxGeometry args={[0.16, 0.02, 1.3]} />
        <meshStandardMaterial color="#f4f1e6" roughness={0.8} />
      </instancedMesh>
    </>
  );
}

function Trees({ count }: { count: number }) {
  const data = useMemo(() => {
    const r = rng(42);
    const samples = Array.from({ length: 160 }, (_, i) => CURVE.getPointAt(i / 159));
    const out: { x: number; z: number; s: number; c: number }[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      const x = -50 + r() * 160;
      const z = -170 + r() * 210;
      const nearRoad = samples.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 42);
      const nearSite = SITES.some((s) => (s.building.x - x) ** 2 + (s.building.z - z) ** 2 < 70);
      if (nearRoad || nearSite) continue;
      out.push({ x, z, s: 0.7 + r() * 0.9, c: r() });
    }
    return out;
  }, [count]);

  const leaves = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    const greens = ["#3f9a4f", "#4fae5a", "#2f8a52", "#69b85a"];
    data.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, 1.9 * t.s, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s, t.s, t.s));
      leaves.current?.setMatrixAt(i, m);
      leaves.current?.setColorAt(i, col.set(greens[Math.floor(t.c * greens.length)]));
      m.compose(new THREE.Vector3(t.x, 0.5 * t.s, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s, t.s, t.s));
      trunks.current?.setMatrixAt(i, m);
    });
    [leaves.current, trunks.current].forEach((x) => {
      if (!x) return;
      x.instanceMatrix.needsUpdate = true;
      if (x.instanceColor) x.instanceColor.needsUpdate = true;
    });
  }, [data]);

  return (
    <>
      <instancedMesh ref={leaves} args={[undefined, undefined, data.length]} castShadow>
        <coneGeometry args={[1.1, 2.8, 7]} />
        <meshStandardMaterial flatShading roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, data.length]}>
        <cylinderGeometry args={[0.16, 0.2, 1, 6]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.9} />
      </instancedMesh>
    </>
  );
}

function Clouds({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 12 }, () => ({
      x: -40 + r() * 140,
      y: 20 + r() * 10,
      z: -160 + r() * 180,
      s: 1.5 + r() * 2,
    }));
  }, []);
  useFrame((_, dt) => {
    if (!group.current || still) return;
    group.current.children.forEach((c, i) => {
      c.position.x += dt * (0.4 + (i % 3) * 0.2);
      if (c.position.x > 110) c.position.x = -50;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[-1.2, 0, 0, 1.1], [0, 0.4, 0, 1.5], [1.3, 0, 0.2, 1.1], [0.3, -0.2, 0.8, 1]].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]}>
              <icosahedronGeometry args={[r, 0]} />
              <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── The five stops ─────────────────────────────────────── */
function Lighthouse({ active, still }: { active: boolean; still: boolean }) {
  const beam = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (beam.current && !still) beam.current.rotation.y += dt * (active ? 1.6 : 0.6);
  });
  const c = STOPS[0].color;
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.8, 10]} />
        <meshStandardMaterial color="#d8d2c4" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 1.4 + i * 1.1, 0]} castShadow>
          <cylinderGeometry args={[1.25 - i * 0.12 - 0.12, 1.25 - i * 0.12, 1.1, 12]} />
          <meshStandardMaterial color={i % 2 ? "#ffffff" : c} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 7.1, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1, 8]} />
        <meshStandardMaterial color="#fff6cf" emissive="#ffd34d" emissiveIntensity={active ? 1.4 : 0.6} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 8, 0]} castShadow>
        <coneGeometry args={[1.1, 1.1, 8]} />
        <meshStandardMaterial color="#2c3440" flatShading />
      </mesh>
      <group ref={beam} position={[0, 7.1, 0]}>
        <mesh position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[1.8, 9, 16, 1, true]} />
          <meshBasicMaterial color="#fff2a8" transparent opacity={active ? 0.32 : 0.16} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function DocStack({ active, still }: { active: boolean; still: boolean }) {
  const tex = useMemo(() => linesTexture("#ffffff", "#0b4f99", 9), []);
  const check = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!check.current || still) return;
    check.current.rotation.y = s.clock.elapsedTime * 0.8;
    check.current.position.y = 7.4 + Math.sin(s.clock.elapsedTime * 2) * 0.25;
  });
  const c = STOPS[1].color;
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[Math.sin(i * 1.7) * 0.25, 0.45 + i * 0.95, Math.cos(i * 1.3) * 0.2]} rotation={[0, i * 0.09 - 0.2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.2, 0.82, 5.4]} />
            <meshStandardMaterial attach="material-0" color="#f2f5fa" />
            <meshStandardMaterial attach="material-1" color="#f2f5fa" />
            <meshStandardMaterial attach="material-2" map={i === 5 ? tex : null} color={i === 5 ? "#ffffff" : "#f7f9fc"} />
            <meshStandardMaterial attach="material-3" color="#e6ebf2" />
            <meshStandardMaterial attach="material-4" color={c} />
            <meshStandardMaterial attach="material-5" color="#e6ebf2" />
          </mesh>
        </group>
      ))}
      <group ref={check} position={[0, 7.4, 0]}>
        <mesh position={[-0.45, -0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.45, 1.3, 0.45]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={active ? 0.5 : 0.15} />
        </mesh>
        <mesh position={[0.45, 0.35, 0]} rotation={[0, 0, -Math.PI / 5]} castShadow>
          <boxGeometry args={[0.45, 2.3, 0.45]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={active ? 0.5 : 0.15} />
        </mesh>
      </group>
    </group>
  );
}

function Factory({ active, still }: { active: boolean; still: boolean }) {
  const gear = useRef<THREE.Group>(null);
  const puffs = useRef<THREE.Group>(null);
  const code = useMemo(() => linesTexture("#141a22", "#ffffff", 10, true), []);
  const c = STOPS[2].color;
  useFrame((_, dt) => {
    if (still) return;
    if (gear.current) gear.current.rotation.z -= dt * (active ? 1.8 : 0.5);
    puffs.current?.children.forEach((p, i) => {
      p.position.y += dt * 1.2;
      const k = (p.position.y - 6) / 5;
      p.scale.setScalar(0.5 + k * 0.9);
      if (p.position.y > 11) p.position.y = 6 + i * 0.1;
    });
  });
  return (
    <group>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3.6, 4.4]} />
        <meshStandardMaterial color="#f1ede6" flatShading />
      </mesh>
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, 4.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.15, 1.15, 4.4, 3, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={c} flatShading side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[2.2, 5, -1.4]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 3.2, 8]} />
        <meshStandardMaterial color="#c9c2b6" flatShading />
      </mesh>
      <group ref={puffs} position={[2.2, 0, -1.4]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 6 + i * 1.25, 0]}>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      {/* Code screen on the front wall */}
      <mesh position={[-0.9, 1.9, 2.21]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial map={code} toneMapped={false} />
      </mesh>
      <group ref={gear} position={[2, 2, 2.3]}>
        <mesh>
          <torusGeometry args={[0.75, 0.22, 8, 20]} />
          <meshStandardMaterial color="#2c3440" flatShading />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 10) * Math.PI * 2]} position={[Math.cos((i / 10) * Math.PI * 2) * 1.05, Math.sin((i / 10) * Math.PI * 2) * 1.05, 0]}>
            <boxGeometry args={[0.32, 0.32, 0.3]} />
            <meshStandardMaterial color="#2c3440" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Rocket({ active, still }: { active: boolean; still: boolean }) {
  const rocket = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const c = STOPS[3].color;
  useFrame((s, dt) => {
    if (!rocket.current) return;
    const lift = active ? 2.2 + Math.sin(s.clock.elapsedTime * 2) * 0.25 : 0;
    rocket.current.position.y = THREE.MathUtils.damp(rocket.current.position.y, lift, 3, dt);
    if (flame.current) {
      const on = active ? 1 : 0.35;
      const flick = still ? 1 : 0.85 + Math.random() * 0.3;
      flame.current.scale.set(on, on * flick, on);
    }
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.6, 2.8, 0.6, 8]} />
        <meshStandardMaterial color="#9aa3b2" flatShading />
      </mesh>
      <mesh position={[-2.1, 2.6, 0]} castShadow>
        <boxGeometry args={[0.35, 4.6, 0.35]} />
        <meshStandardMaterial color="#cfd5de" />
      </mesh>
      <group ref={rocket}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.9, 1, 4.2, 12]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        <mesh position={[0, 6.3, 0]} castShadow>
          <coneGeometry args={[0.9, 1.7, 12]} />
          <meshStandardMaterial color={c} flatShading />
        </mesh>
        <mesh position={[0, 4.3, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 12]} />
          <meshStandardMaterial color="#4fc3ff" emissive="#4fc3ff" emissiveIntensity={0.3} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 0.95, 1.7, Math.sin((i / 3) * Math.PI * 2) * 0.95]} rotation={[0, -(i / 3) * Math.PI * 2, 0]} castShadow>
            <boxGeometry args={[0.9, 1.3, 0.14]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
        ))}
        <mesh ref={flame} position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.65, 1.8, 10]} />
          <meshBasicMaterial color="#ffb03b" toneMapped={false} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Chart({ active }: { active: boolean }) {
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const H = [1.6, 2.6, 3.8, 5.4];
  const c = STOPS[4].color;
  useFrame((_, dt) => {
    bars.current.forEach((b, i) => {
      if (!b) return;
      const target = active ? 1 : 0.55;
      b.scale.y = THREE.MathUtils.damp(b.scale.y, target, 3 + i, dt);
      b.position.y = (H[i] * b.scale.y) / 2 + 0.4;
    });
  });
  return (
    <group>
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[7, 0.4, 3.2]} />
        <meshStandardMaterial color="#e9ecef" flatShading />
      </mesh>
      {H.map((h, i) => (
        <mesh key={i} ref={(m) => { bars.current[i] = m; }} position={[-2.4 + i * 1.6, h / 2 + 0.4, 0]} castShadow>
          <boxGeometry args={[1.1, h, 1.4]} />
          <meshStandardMaterial color={i === 3 ? c : "#cbeedd"} flatShading />
        </mesh>
      ))}
      <mesh position={[0.3, 6.1, 0]} rotation={[0, 0, 0.62]} castShadow>
        <boxGeometry args={[6.6, 0.28, 0.28]} />
        <meshStandardMaterial color="#14202e" />
      </mesh>
      <mesh position={[3.1, 7.95, 0]} rotation={[0, 0, -Math.PI / 2 + 0.62]} castShadow>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="#14202e" />
      </mesh>
    </group>
  );
}

const BUILDINGS = [Lighthouse, DocStack, Factory, Rocket, Chart];

function StopSite({ i, active, still, onPick }: { i: number; active: boolean; still: boolean; onPick: (i: number) => void }) {
  const site = SITES[i];
  const stop = STOPS[i];
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const kick = useRef(0);
  const was = useRef(active);
  const sign = useMemo(() => signTexture(stop.name, stop.color), [stop]);
  const B = BUILDINGS[i];

  // Face the building's front towards the road.
  const yaw = Math.atan2(site.road.x - site.building.x, site.road.z - site.building.z);
  const signYaw = Math.atan2(-site.tangent.x, -site.tangent.z);

  useFrame((s, dt) => {
    if (active && !was.current) kick.current = 1;
    was.current = active;
    kick.current = Math.max(0, kick.current - dt * 1.4);
    if (group.current) {
      const bounce = still ? 0 : Math.sin(kick.current * Math.PI * 3) * kick.current * 0.12;
      group.current.scale.setScalar(1 + bounce);
    }
    if (ring.current) ring.current.opacity = THREE.MathUtils.damp(ring.current.opacity, active ? 0.9 : 0.35, 6, dt);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const out = () => (document.body.style.cursor = "");

  return (
    <>
      <mesh position={[site.building.x, 0.03, site.building.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 5.3, 40]} />
        <meshBasicMaterial ref={ring} color={stop.color} transparent opacity={0.35} />
      </mesh>
      <mesh position={[site.building.x, 0.02, site.building.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.6, 40]} />
        <meshStandardMaterial color={GRASS_DARK} />
      </mesh>
      <group
        ref={group}
        position={site.building}
        rotation={[0, yaw, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPick(i);
        }}
        onPointerOver={over}
        onPointerOut={out}
      >
        <B active={active} still={still} />
      </group>
      <group position={site.sign} rotation={[0, signYaw, 0]}>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]} castShadow>
            <boxGeometry args={[0.14, 2.4, 0.14]} />
            <meshStandardMaterial color="#5b4636" />
          </mesh>
        ))}
        <mesh position={[0, 2.3, 0.05]} castShadow>
          <boxGeometry args={[2.9, 1.15, 0.12]} />
          <meshStandardMaterial attach="material-0" color="#ffffff" />
          <meshStandardMaterial attach="material-1" color="#ffffff" />
          <meshStandardMaterial attach="material-2" color="#ffffff" />
          <meshStandardMaterial attach="material-3" color="#ffffff" />
          <meshStandardMaterial attach="material-4" map={sign} />
          <meshStandardMaterial attach="material-5" map={sign} />
        </mesh>
      </group>
    </>
  );
}

/* ── The car, the camera and the sun ────────────────────── */
function Car({ progress, carRef, still }: { progress: MutableRefObject<number>; carRef: MutableRefObject<THREE.Group | null>; still: boolean }) {
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const body = useRef<THREE.Group>(null);
  const u = useRef(roadPosition(progress.current));
  const tmpT = useMemo(() => new THREE.Vector3(), []);

  useFrame((s, dt) => {
    const g = carRef.current;
    if (!g) return;
    const target = roadPosition(progress.current);
    const prev = u.current;
    u.current = still ? target : THREE.MathUtils.damp(u.current, target, 3.2, dt);
    g.userData.u = u.current;
    const du = u.current - prev;
    const p = CURVE.getPointAt(Math.min(Math.max(u.current, 0), 1));
    CURVE.getTangentAt(Math.min(Math.max(u.current, 0.0001), 0.9999), tmpT);
    if (du < 0) tmpT.negate();
    g.position.set(p.x, 0, p.z);
    const yaw = Math.atan2(tmpT.x, tmpT.z);
    // Smallest-angle turn.
    let d = yaw - g.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.rotation.y += d * Math.min(1, dt * 10);
    const dist = Math.abs(du) * LEN;
    wheels.current.forEach((w) => w && (w.rotation.x += dist / 0.42));
    if (body.current) {
      const speed = dist / Math.max(dt, 1e-4);
      body.current.position.y = 0.62 + (still ? 0 : Math.sin(s.clock.elapsedTime * 18) * Math.min(speed, 12) * 0.004);
      body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, -Math.min(speed, 14) * 0.006, 6, dt);
    }
  });

  const wheelPos: [number, number, number][] = [[-0.85, 0.42, 0.85], [0.85, 0.42, 0.85], [-0.85, 0.42, -0.85], [0.85, 0.42, -0.85]];
  return (
    <group ref={carRef}>
      <group ref={body} position={[0, 0.62, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.7, 0.6, 3]} />
          <meshStandardMaterial color={CAR} flatShading roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.55, -0.2]} castShadow>
          <boxGeometry args={[1.45, 0.55, 1.6]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0.62]}>
          <boxGeometry args={[1.3, 0.42, 0.04]} />
          <meshStandardMaterial color="#26313f" roughness={0.2} metalness={0.3} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={`h${x}`} position={[x, 0, 1.51]}>
            <boxGeometry args={[0.36, 0.2, 0.04]} />
            <meshBasicMaterial color="#fff4c2" toneMapped={false} />
          </mesh>
        ))}
        {[-0.6, 0.6].map((x) => (
          <mesh key={`t${x}`} position={[x, 0.05, -1.51]}>
            <boxGeometry args={[0.34, 0.16, 0.04]} />
            <meshBasicMaterial color="#ff3b30" toneMapped={false} />
          </mesh>
        ))}
        {/* Roof sign */}
        <mesh position={[0, 1.02, -0.2]} castShadow>
          <boxGeometry args={[0.9, 0.34, 0.12]} />
          <meshStandardMaterial color="#ffc23d" />
        </mesh>
      </group>
      {wheelPos.map((w, i) => (
        <mesh key={i} ref={(m) => { wheels.current[i] = m; }} position={w} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.34, 14]} />
          <meshStandardMaterial color="#1f2630" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ carRef, active, still, mobile }: { carRef: MutableRefObject<THREE.Group | null>; active: number; still: boolean; mobile: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const start = useRef<number | null>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const tmp = useMemo(() => ({ t: new THREE.Vector3(), cam: new THREE.Vector3(), at: new THREE.Vector3(), from: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const car = carRef.current;
    if (!car) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - start.current;

    const forward = tmp.t.set(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
    const left = leftOf(forward);
    const back = mobile ? 15 : 12;
    const height = mobile ? 9.5 : 7;
    // Camera sits behind and to the right, so the buildings on the left fill the frame.
    tmp.cam
      .copy(car.position)
      .addScaledVector(forward, -back)
      .addScaledVector(left, -5)
      .add(new THREE.Vector3(0, height, 0));
    if (!mobile && !still) {
      tmp.cam.addScaledVector(left, -state.pointer.x * 2);
      tmp.cam.y += state.pointer.y * 1.2;
    }
    tmp.at.copy(car.position).addScaledVector(forward, 7).add(new THREE.Vector3(0, 1.2, 0));

    // Near a stop, blend to a framing shot from across the road: car in front, building behind it.
    const cu: number = car.userData.u ?? 0;
    let best = -1;
    let bestD = 1;
    STOPS.forEach((s, i) => {
      const d = Math.abs(cu - s.u);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    const w = best >= 0 ? THREE.MathUtils.smoothstep(0.075, 0.012, bestD) : 0;
    if (w > 0) {
      const s = SITES[best];
      const right = leftOf(s.tangent).negate();
      const frameCam = s.road
        .clone()
        .addScaledVector(right, mobile ? 17 : 14)
        .addScaledVector(s.tangent, mobile ? -9 : -8)
        .add(new THREE.Vector3(0, mobile ? 11 : 8.5, 0));
      // Desktop keeps the building left of centre (the panel sits on the right);
      // phones keep it in the top half (the panel sits at the bottom).
      const frameAt = s.road.clone().lerp(s.building, mobile ? 0.6 : 0.3).add(new THREE.Vector3(0, mobile ? -0.5 : 2.4, 0));
      if (!mobile) frameAt.addScaledVector(right, 3.5).addScaledVector(s.tangent, 2);
      tmp.cam.lerp(frameCam, w);
      tmp.at.lerp(frameAt, w);
    }
    void active;

    // Opening shot: from high above the world, swooping down behind the car.
    const intro = still ? 1 : Math.min(age / 2.6, 1);
    const k = 1 - Math.pow(1 - intro, 4);
    if (k < 1) {
      tmp.from.set(20, 75, 25);
      tmp.cam.lerpVectors(tmp.from, tmp.cam, k);
      camera.position.copy(tmp.cam);
      look.current.lerpVectors(new THREE.Vector3(28, 0, -55), tmp.at, k);
    } else {
      camera.position.lerp(tmp.cam, Math.min(1, dt * 3));
      look.current.lerp(tmp.at, Math.min(1, dt * 3));
    }
    camera.lookAt(look.current);

    if (sun.current) {
      sun.current.position.copy(car.position).add(new THREE.Vector3(18, 32, 12));
      sun.current.target.position.copy(car.position);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={sun}
      intensity={2.2}
      color="#fff4dc"
      castShadow
      shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
      shadow-camera-left={-26}
      shadow-camera-right={26}
      shadow-camera-top={26}
      shadow-camera-bottom={-26}
      shadow-camera-near={1}
      shadow-camera-far={90}
      shadow-bias={-0.0005}
    />
  );
}

function Scene({ progress, active, onPick, still, mobile }: { progress: MutableRefObject<number>; active: number; onPick: (i: number) => void; still: boolean; mobile: boolean }) {
  const carRef = useRef<THREE.Group | null>(null);
  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 70, 190]} />
      <hemisphereLight args={["#ffffff", "#7aa860", 1.05]} />
      <Rig carRef={carRef} active={active} still={still} mobile={mobile} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0, -60]} receiveShadow>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      <Road />
      <Trees count={mobile ? 90 : 190} />
      <Clouds still={still} />
      {STOPS.map((s, i) => (
        <StopSite key={s.id} i={i} active={active === i} still={still} onPick={onPick} />
      ))}
      <Car progress={progress} carRef={carRef} still={still} />
    </>
  );
}

export default function World({
  progress,
  active,
  onPick,
}: {
  progress: MutableRefObject<number>;
  active: number;
  onPick: (i: number) => void;
}) {
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    // Signboards paint text into canvases, so wait for the web fonts.
    document.fonts.ready.then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Canvas
      shadows
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: mobile ? 55 : 42, near: 0.5, far: 260, position: [20, 75, 25] }}
      gl={{ antialias: true }}
      style={{ touchAction: "pan-y" }}
    >
      <Scene progress={progress} active={active} onPick={onPick} still={still} mobile={mobile} />
    </Canvas>
  );
}
