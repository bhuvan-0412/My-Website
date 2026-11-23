"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { scene } from "./formation";

/* Palette (mirrors the CSS tokens) */
const INK = "#0d1321";
const TANGERINE = "#ff6b2c";
const MINT = "#c9cfd9";
const PAPER = "#f2f4f7";
const SUN = "#ffb38f";

type Kind = "sticky" | "cursor" | "phone" | "toggle" | "code";

type Item = {
  kind: Kind;
  color: string;
  base: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  phase: number;
  /** Slot on the roadmap line when the formation is on. */
  slot: THREE.Vector3;
};

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function codeTexture() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 192;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#141b2d";
  g.fillRect(0, 0, 256, 192);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(20 + i * 18, 18, 6, 0, Math.PI * 2);
    g.fill();
  });
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    const indent = [0, 1, 2, 2, 1, 2, 1, 0][i] * 18;
    g.fillStyle = [TANGERINE, MINT, "#8fb4ff", "#e6e9f0"][i % 4];
    g.fillRect(18 + indent, 44 + i * 17, 40 + r() * (150 - indent), 8);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stickyTexture(color: string) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(13,19,33,0.28)";
  [0, 1, 2].forEach((i) => g.fillRect(36, 70 + i * 44, i === 2 ? 110 : 180, 14));
  g.fillStyle = "rgba(0,0,0,0.06)";
  g.fillRect(0, 0, 256, 34);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const cursorShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, -1.6);
  s.lineTo(0.42, -1.2);
  s.lineTo(0.7, -1.85);
  s.lineTo(0.98, -1.72);
  s.lineTo(0.7, -1.08);
  s.lineTo(1.2, -1.08);
  s.closePath();
  return s;
})();

function Artifact({ item, tex }: { item: Item; tex: Record<string, THREE.Texture> }) {
  switch (item.kind) {
    case "sticky":
      return (
        <RoundedBox args={[1.5, 1.5, 0.08]} radius={0.04} smoothness={2}>
          <meshStandardMaterial attach="material" map={tex[`sticky-${item.color}`]} roughness={0.55} />
        </RoundedBox>
      );
    case "cursor":
      return (
        <mesh position={[-0.6, 0.9, 0]}>
          <extrudeGeometry args={[cursorShape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 }]} />
          <meshPhysicalMaterial color={item.color} roughness={0.25} clearcoat={1} />
        </mesh>
      );
    case "phone":
      return (
        <group>
          <RoundedBox args={[1.1, 2.1, 0.16]} radius={0.16} smoothness={4}>
            <meshPhysicalMaterial color={INK} roughness={0.3} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0, 0, 0.085]}>
            <planeGeometry args={[0.92, 1.85]} />
            <meshBasicMaterial color={item.color} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.55, 0.09]}>
            <planeGeometry args={[0.6, 0.12]} />
            <meshBasicMaterial color={INK} transparent opacity={0.35} />
          </mesh>
        </group>
      );
    case "toggle":
      return (
        <group>
          <RoundedBox args={[1.7, 0.85, 0.36]} radius={0.17} smoothness={4}>
            <meshPhysicalMaterial color={item.color} roughness={0.3} clearcoat={0.8} />
          </RoundedBox>
          <mesh position={[0.42, 0, 0.12]}>
            <sphereGeometry args={[0.34, 24, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} />
          </mesh>
        </group>
      );
    case "code":
      return (
        <RoundedBox args={[2.1, 1.55, 0.1]} radius={0.08} smoothness={3}>
          <meshStandardMaterial attach="material" map={tex.code} roughness={0.4} />
        </RoundedBox>
      );
  }
}

function Field({ count, mobile, still }: { count: number; mobile: boolean; still: boolean }) {
  const { viewport, camera } = useThree();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const pointer = useRef(new THREE.Vector2(99, 99));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const tex = useMemo(() => {
    const t: Record<string, THREE.Texture> = { code: codeTexture() };
    [SUN, MINT, TANGERINE, PAPER].forEach((c) => (t[`sticky-${c}`] = stickyTexture(c)));
    return t;
  }, []);

  const items = useMemo<Item[]>(() => {
    const r = rng(11);
    const kinds: Kind[] = ["sticky", "sticky", "cursor", "phone", "toggle", "code", "sticky"];
    const colors: Record<Kind, string[]> = {
      sticky: [SUN, MINT, TANGERINE, PAPER],
      cursor: [PAPER, TANGERINE],
      phone: [MINT, TANGERINE],
      toggle: [MINT, TANGERINE],
      code: ["code"],
    };
    return Array.from({ length: count }, (_, i) => {
      const kind = kinds[i % kinds.length];
      const pal = colors[kind];
      // Spread across a tall column so artifacts keep appearing as the page scrolls.
      // Bias towards the left and right edges so headlines in the middle stay readable.
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (mobile ? 2.6 + r() * 3.4 : 6.5 + r() * 6.5);
      const base = new THREE.Vector3(x, (r() - 0.5) * 30, -8 + r() * 6);
      // Roadmap slot: a rising diagonal across the screen.
      const t = i / Math.max(1, count - 1);
      const slot = new THREE.Vector3(-11 + t * 22, -4.5 + t * 9 + Math.sin(t * 9) * 0.6, -2 + Math.cos(t * 7) * 1.2);
      return {
        kind,
        color: pal[Math.floor(r() * pal.length)],
        base,
        rot: new THREE.Euler(r() * 6, r() * 6, r() * 6),
        spin: new THREE.Vector3((r() - 0.5) * 0.5, (r() - 0.5) * 0.6, (r() - 0.5) * 0.4),
        scale: (mobile ? 0.55 : 0.7) + r() * 0.45,
        phase: r() * 10,
        slot,
      };
    });
  }, [count, mobile]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const leave = () => pointer.current.set(99, 99);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  const live = useMemo(() => items.map((it) => ({ pos: it.base.clone(), vel: new THREE.Vector3(), rot: it.rot.clone() })), [items]);
  const form = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    form.current = THREE.MathUtils.damp(form.current, scene.formation, 3, dt);
    scene.burst = Math.max(0, scene.burst - dt * 1.2);
    const span = 30;
    const scrollY = scene.scroll * 0.012;

    let pointerOn = false;
    if (!mobile && Math.abs(pointer.current.x) <= 1) {
      ray.setFromCamera(pointer.current, camera);
      pointerOn = !!ray.ray.intersectPlane(plane, hit);
    }

    items.forEach((it, i) => {
      const g = groups.current[i];
      if (!g) return;
      const L = live[i];
      // Free-floating target: drifts, scrolls with the page (parallax by depth) and wraps vertically.
      const depth = 0.55 + (it.base.z + 7) / 7 * 0.7;
      let y = it.base.y + scrollY * depth + (still ? 0 : Math.sin(t * 0.5 + it.phase) * 0.35);
      y = ((((y + span / 2) % span) + span) % span) - span / 2;
      const free = new THREE.Vector3(it.base.x + (still ? 0 : Math.cos(t * 0.3 + it.phase) * 0.3), y, it.base.z);
      const target = free.lerp(it.slot, form.current);

      // Cursor pushes nearby artifacts away.
      if (pointerOn) {
        const dx = L.pos.x - hit.x;
        const dy = L.pos.y - hit.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9) {
          const f = (9 - d2) * 0.9;
          L.vel.x += (dx / Math.sqrt(d2 + 0.01)) * f * dt;
          L.vel.y += (dy / Math.sqrt(d2 + 0.01)) * f * dt;
        }
      }
      // Page transitions blow the field outwards for a moment.
      if (scene.burst > 0) {
        L.vel.x += Math.sign(L.pos.x || 1) * scene.burst * 14 * dt;
        L.vel.y += (L.pos.y >= 0 ? 1 : -1) * scene.burst * 8 * dt;
      }
      L.vel.multiplyScalar(Math.exp(-dt * 3));
      // A big jump (wrapping) snaps instead of flying across the screen.
      if (Math.abs(target.y - L.pos.y) > span * 0.5) L.pos.y = target.y;
      L.pos.x += (target.x - L.pos.x) * (1 - Math.exp(-dt * 2.5)) + L.vel.x * dt;
      L.pos.y += (target.y - L.pos.y) * (1 - Math.exp(-dt * 2.5)) + L.vel.y * dt;
      L.pos.z += (target.z - L.pos.z) * (1 - Math.exp(-dt * 2.5));
      g.position.copy(L.pos);

      if (!still) {
        L.rot.x += it.spin.x * dt * (1 - form.current * 0.8);
        L.rot.y += it.spin.y * dt * (1 - form.current * 0.8);
        L.rot.z += it.spin.z * dt * (1 - form.current * 0.8);
      }
      // In formation the artifacts turn to face the viewer, tilted along the line.
      const k = form.current;
      g.rotation.set(L.rot.x * (1 - k), L.rot.y * (1 - k) + k * 0.25, L.rot.z * (1 - k) + k * 0.35);
      g.scale.setScalar(it.scale * (1 + k * 0.15));
    });

    void viewport;
  });

  return (
    <>
      {items.map((it, i) => (
        <group key={i} ref={(g) => { groups.current[i] = g; }}>
          <Artifact item={it} tex={tex} />
        </group>
      ))}
    </>
  );
}

export default function Artifacts3D() {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
    const onScroll = () => (scene.scroll = window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!ready) return null;
  return (
    <div className="artifacts" aria-hidden>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 38, position: [0, 0, 22], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 10, 8]} intensity={1.6} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 6]} scale={[14, 4, 1]} />
          <Lightformer intensity={1} color={MINT} position={[-8, 0, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer intensity={1} color={TANGERINE} position={[8, -2, 4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
        </Environment>
        <Field count={mobile ? 12 : 26} mobile={mobile} still={still} />
      </Canvas>
    </div>
  );
}
