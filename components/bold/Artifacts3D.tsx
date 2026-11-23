"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { samplePoints } from "./symbols";

/* Palette: ink + tangerine, with off-white and soft tints of the two */
const INK = "#0d1321";
const TAN = "#ff6b2c";
const TAN_SOFT = "#ffb38f";
const PAPER = "#f2f4f7";
const GREY = "#c9cfd9";

type Kind = "sticky" | "cursor" | "phone" | "toggle" | "code";

type Item = {
  kind: Kind;
  color: string;
  /** Scale that brings each artifact to roughly the same footprint. */
  base: number;
  size: number;
  depth: number;
  phase: number;
  spin: number;
};

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* ── The product artifacts ─────────────────────────────── */
function codeTexture() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 192;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#141b2d";
  g.fillRect(0, 0, 256, 192);
  [TAN, GREY, GREY].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(20 + i * 18, 18, 6, 0, Math.PI * 2);
    g.fill();
  });
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    const indent = [0, 1, 2, 2, 1, 2, 1, 0][i] * 18;
    g.fillStyle = [TAN, PAPER, GREY, TAN_SOFT][i % 4];
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

const KINDS: Kind[] = ["sticky", "code", "cursor", "sticky", "phone", "toggle", "sticky", "cursor"];
const COLORS: Record<Kind, string[]> = {
  sticky: [TAN, PAPER, TAN_SOFT, GREY],
  cursor: [PAPER, TAN],
  phone: [TAN, PAPER],
  toggle: [TAN, GREY],
  code: ["code"],
};
const BASE: Record<Kind, number> = { sticky: 0.55, cursor: 0.62, phone: 0.48, toggle: 0.5, code: 0.42 };

/** 0 at the top of the page, 1 once you've scrolled most of the first screen. */
const scrollMix = () => (typeof window === "undefined" ? 0 : Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85))));

function Field({ count, mobile, still, shape }: { count: number; mobile: boolean; still: boolean; shape: React.MutableRefObject<string> }) {
  const { camera, size } = useThree();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const pointer = useRef(new THREE.Vector2(99, 99));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 5.5), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const tex = useMemo(() => {
    const t: Record<string, THREE.Texture> = { code: codeTexture() };
    COLORS.sticky.forEach((c) => (t[`sticky-${c}`] = stickyTexture(c)));
    return t;
  }, []);

  const items = useMemo<Item[]>(() => {
    const r = rng(11);
    return Array.from({ length: count }, (_, i) => {
      const kind = KINDS[i % KINDS.length];
      const pal = COLORS[kind];
      return {
        kind,
        color: pal[Math.floor(r() * pal.length)],
        base: BASE[kind],
        size: (mobile ? 0.8 : 1) * (0.9 + r() * 0.35),
        depth: -7 + r() * 3.5,
        phase: r() * 10,
        spin: (r() - 0.5) * 0.9,
      };
    });
  }, [count, mobile]);

  // A fixed shuffle so neighbours in a symbol are different artifacts.
  const order = useMemo(() => {
    const r = rng(5);
    const idx = items.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [items]);

  const live = useMemo(
    () => items.map((_, i) => ({ pos: new THREE.Vector3(Math.sin(i * 7.3) * 16, Math.cos(i * 3.1) * 11, -9), vel: new THREE.Vector3(), rot: new THREE.Euler() })),
    [items]
  );
  /** Symbol layout relative to its centre. */
  const local = useRef<THREE.Vector3[]>([]);
  const lastKey = useRef("");
  const mix = useRef(scrollMix());
  const view = useRef({ w: 1, h: 1 });

  useEffect(() => {
    const move = (e: PointerEvent) => pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const leave = () => pointer.current.set(99, 99);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;

    const key = `${shape.current}-${size.width}x${size.height}`;
    if (key !== lastKey.current) {
      lastKey.current = key;
      const dist = cam.position.z + 5.5;
      const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const visW = visH * (size.width / size.height);
      view.current = { w: visW, h: visH };
      const scale = mobile ? Math.min(visW * 0.36, visH * 0.22) : visH * 0.34;
      const pts = samplePoints(shape.current, items.length);
      const byItem: THREE.Vector3[] = new Array(items.length);
      order.forEach((itemIndex, k) => {
        const [x, y] = pts[k];
        byItem[itemIndex] = new THREE.Vector3(x * scale, y * scale, items[itemIndex].depth);
      });
      local.current = byItem;
    }

    // At the top of the page the symbol sits on the right; scrolling eases it to the centre.
    mix.current = THREE.MathUtils.damp(mix.current, scrollMix(), 4, dt);
    const m = mix.current * mix.current * (3 - 2 * mix.current);
    const { w: visW, h: visH } = view.current;
    const cx = mobile ? 0 : visW * 0.24 * (1 - m);
    const cy = mobile ? visH * 0.12 * (1 - m) : -visH * 0.02;

    let pointerOn = false;
    if (!mobile && Math.abs(pointer.current.x) <= 1) {
      ray.setFromCamera(pointer.current, cam);
      pointerOn = !!ray.ray.intersectPlane(plane, hit);
    }

    items.forEach((item, i) => {
      const g = groups.current[i];
      const lp = local.current[i];
      if (!g || !lp) return;
      const tx = cx + lp.x;
      const ty = cy + lp.y;
      const L = live[i];
      // The cursor pushes artifacts away; they drift back into the symbol.
      if (pointerOn) {
        const dx = L.pos.x - hit.x;
        const dy = L.pos.y - hit.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 7) {
          const f = (7 - d2) * 1.6;
          const d = Math.sqrt(d2 + 0.01);
          L.vel.x += (dx / d) * f * dt;
          L.vel.y += (dy / d) * f * dt;
        }
      }
      L.vel.multiplyScalar(Math.exp(-dt * 2.6));
      // Each artifact moves at its own pace, so a symbol assembles in a ripple.
      const k = 1 - Math.exp(-dt * (1.5 + (i % 7) * 0.18));
      const bob = still ? 0 : Math.sin(t * 0.8 + item.phase) * 0.08;
      L.pos.x += (tx - L.pos.x) * k + L.vel.x * dt;
      L.pos.y += (ty + bob - L.pos.y) * k + L.vel.y * dt;
      L.pos.z += (lp.z - L.pos.z) * k;
      g.position.copy(L.pos);
      const travel = Math.min(1, Math.hypot(tx - L.pos.x, ty - L.pos.y) / 4);
      if (!still) {
        L.rot.x = Math.sin(t * 0.6 + item.phase) * 0.22 + travel * 1.2 * item.spin;
        L.rot.y = Math.cos(t * 0.5 + item.phase) * 0.3 + travel * 1.6 * item.spin;
        L.rot.z = Math.sin(t * 0.4 + item.phase) * 0.15 + travel * item.spin;
      }
      g.rotation.copy(L.rot);
      g.scale.setScalar(item.base * item.size);
    });
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
  const shape = useRef("bulb");
  const layer = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  // Sharp at the top of the page; it softens (blur, a little fade) as you scroll into the content.
  useEffect(() => {
    const onScroll = () => {
      const m = scrollMix();
      if (layer.current) {
        layer.current.style.filter = m > 0.01 ? `blur(${(m * 2.2).toFixed(2)}px)` : "none";
        layer.current.style.opacity = String(1 - m * 0.2);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready, path]);

  // Watch which section is in the middle of the screen and take its symbol.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const start = window.setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-shape]"));
      if (els[0]?.dataset.shape) shape.current = els[0].dataset.shape;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const s = (e.target as HTMLElement).dataset.shape;
            if (e.isIntersecting && s) shape.current = s;
          });
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      els.forEach((el) => io!.observe(el));
    }, 350);
    return () => {
      window.clearTimeout(start);
      io?.disconnect();
    };
  }, [path]);

  if (!ready) return null;
  return (
    <div ref={layer} className="artifacts" aria-hidden>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 38, position: [0, 0, 22], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 8]} intensity={1.5} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 6]} scale={[14, 4, 1]} />
          <Lightformer intensity={1.2} color={TAN} position={[8, -2, 4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer intensity={0.8} color={PAPER} position={[-8, 0, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        </Environment>
        <Field count={mobile ? 24 : 38} mobile={mobile} still={still} shape={shape} />
      </Canvas>
    </div>
  );
}
