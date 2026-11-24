"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { samplePoints, segmentPairs } from "./symbols";
import { scene } from "./formation";

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

export type ShapeState = { name: string; tone: "ink" | "paper" | "tangerine" };

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
/** Smaller than before: more of them, packed along the outline, reads as a clear icon. */
const BASE: Record<Kind, number> = { sticky: 0.4, cursor: 0.44, phone: 0.35, toggle: 0.36, code: 0.31 };

/** 0 at the top of the page, 1 once you've scrolled most of the first screen. */
const scrollMix = () => (typeof window === "undefined" ? 0 : Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85))));

/** The plane the symbol is drawn on (artifacts sit just in front of and behind it). */
const PLANE_Z = -5.5;

function Field({ count, mobile, still, shape }: { count: number; mobile: boolean; still: boolean; shape: React.MutableRefObject<ShapeState> }) {
  const { camera, size } = useThree();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const pointer = useRef(new THREE.Vector2(99, 99));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANE_Z), []);
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
        size: (mobile ? 0.85 : 1) * (0.9 + r() * 0.25),
        depth: PLANE_Z - 0.6 + r() * 1.2,
        phase: r() * 10,
        spin: (r() - 0.5) * 1.4,
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
  /** Where each artifact goes when the symbol breaks apart: an even spread over the whole screen. */
  const spread = useRef<THREE.Vector3[]>([]);
  const lastKey = useRef("");
  const mix = useRef(scrollMix());
  const view = useRef({ w: 1, h: 1 });

  /* Scroll drives the break-apart: moving = scattered, resting = a clear symbol. */
  const lastY = useRef(typeof window === "undefined" ? 0 : window.scrollY);
  const movedAt = useRef(-10);
  const scatter = useRef(0);

  /* The outline that draws itself through the artifacts. */
  const line = useMemo(() => {
    const mat = new LineMaterial({ color: TAN, linewidth: mobile ? 2.4 : 3.4, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    const l = new LineSegments2(new LineSegmentsGeometry(), mat);
    l.renderOrder = 10;
    l.frustumCulled = false;
    return l;
  }, [mobile]);
  const segCount = useRef(0);
  const draw = useRef(0);

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

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as LineMaterial).dispose();
    },
    [line]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;

    // Page transitions and scrolling both break the symbol apart.
    const y = window.scrollY;
    if (Math.abs(y - lastY.current) > 0.6) movedAt.current = t;
    lastY.current = y;
    if (scene.burst > 0) {
      movedAt.current = t;
      scene.burst = 0;
    }

    const key = `${shape.current.name}-${size.width}x${size.height}`;
    if (key !== lastKey.current) {
      // A new symbol: scatter briefly, then gather into it.
      if (lastKey.current) movedAt.current = Math.max(movedAt.current, t - 0.05);
      lastKey.current = key;
      const dist = cam.position.z - PLANE_Z;
      const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const visW = visH * (size.width / size.height);
      const scale = mobile ? Math.min(visW * 0.34, visH * 0.2) : visH * 0.33;
      view.current = { w: visW, h: visH };

      const pts = samplePoints(shape.current.name, items.length);
      const byItem: THREE.Vector3[] = new Array(items.length);
      order.forEach((itemIndex, k) => {
        const [x, y] = pts[k];
        byItem[itemIndex] = new THREE.Vector3(x * scale, y * scale, items[itemIndex].depth);
      });
      local.current = byItem;

      // Even spread: a jittered grid over the whole screen.
      const cols = Math.max(3, Math.round(Math.sqrt((items.length * visW) / visH)));
      const rows = Math.ceil(items.length / cols);
      const r = rng(23);
      const cells = Array.from({ length: cols * rows }, (_, c) => c);
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      spread.current = items.map((_, i) => {
        const c = cells[i];
        const gx = ((c % cols) + 0.5 + (r() - 0.5) * 0.6) / cols;
        const gy = (Math.floor(c / cols) + 0.5 + (r() - 0.5) * 0.6) / rows;
        return new THREE.Vector3((gx - 0.5) * visW * 0.98, (gy - 0.5) * visH * 0.94, PLANE_Z - 1.6 + r() * 3.2);
      });

      // The outline, in the same units as the symbol.
      const pairs = segmentPairs(shape.current.name);
      const pos = new Float32Array((pairs.length / 2) * 3);
      for (let i = 0, j = 0; i < pairs.length; i += 2, j += 3) {
        pos[j] = pairs[i] * scale;
        pos[j + 1] = pairs[i + 1] * scale;
        pos[j + 2] = 0;
      }
      line.geometry.dispose();
      line.geometry = new LineSegmentsGeometry().setPositions(pos);
      segCount.current = pairs.length / 4;
      draw.current = 0;
    }

    // At the top of the page the symbol sits on the right; scrolling eases it to the centre.
    mix.current = THREE.MathUtils.damp(mix.current, scrollMix(), 4, dt);
    const m = mix.current * mix.current * (3 - 2 * mix.current);
    const { w: visW, h: visH } = view.current;
    const cx = mobile ? 0 : visW * 0.26 * (1 - m);
    const cy = mobile ? visH * 0.2 * (1 - m) : -visH * 0.02;
    // Centred behind the content, the symbol grows so it reads around the cards.
    const grow = mobile ? 1 : 1 + 0.22 * m;

    // Break apart fast while scrolling; gather back a beat after it stops.
    const moving = !still && t - movedAt.current < 0.22;
    scatter.current = THREE.MathUtils.damp(scatter.current, moving ? 1 : 0, moving ? 5 : 2.2, dt);
    const s = scatter.current * scatter.current * (3 - 2 * scatter.current);

    // The outline hides while scattered, then traces itself in once the artifacts are nearly home.
    if (s > 0.35) draw.current = 0;
    else if (s < 0.12) draw.current = Math.min(1, draw.current + dt * (still ? 99 : 0.9));
    const traced = 1 - Math.pow(1 - draw.current, 3);
    line.geometry.instanceCount = Math.ceil(segCount.current * traced);
    const mat = line.material as LineMaterial;
    mat.opacity = 0.85 * (1 - s) * Math.min(1, draw.current * 4);
    mat.color.set(shape.current.tone === "tangerine" ? INK : TAN);
    mat.resolution.set(size.width, size.height);
    line.position.set(cx, cy, PLANE_Z);
    line.scale.setScalar(grow);

    let pointerOn = false;
    if (!mobile && Math.abs(pointer.current.x) <= 1) {
      ray.setFromCamera(pointer.current, cam);
      pointerOn = !!ray.ray.intersectPlane(plane, hit);
    }

    items.forEach((item, i) => {
      const g = groups.current[i];
      const lp = local.current[i];
      const sp = spread.current[i];
      if (!g || !lp || !sp) return;
      // Scattered positions drift slowly so the spread feels alive.
      const sx = sp.x + Math.sin(t * 0.3 + item.phase) * 0.4;
      const sy = sp.y + Math.cos(t * 0.27 + item.phase) * 0.4;
      const tx = THREE.MathUtils.lerp(cx + lp.x * grow, sx, s);
      const ty = THREE.MathUtils.lerp(cy + lp.y * grow, sy, s);
      const tz = THREE.MathUtils.lerp(lp.z, sp.z, s);
      const L = live[i];
      // The cursor pushes artifacts away; they drift back into place.
      if (pointerOn) {
        const dx = L.pos.x - hit.x;
        const dy = L.pos.y - hit.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 5) {
          const f = (5 - d2) * 1.8;
          const d = Math.sqrt(d2 + 0.01);
          L.vel.x += (dx / d) * f * dt;
          L.vel.y += (dy / d) * f * dt;
        }
      }
      L.vel.multiplyScalar(Math.exp(-dt * 2.6));
      // Each artifact moves at its own pace, so a symbol assembles in a ripple.
      const k = 1 - Math.exp(-dt * (2.2 + (i % 9) * 0.22));
      const bob = still ? 0 : Math.sin(t * 0.8 + item.phase) * 0.05 * (1 - s);
      L.pos.x += (tx - L.pos.x) * k + L.vel.x * dt;
      L.pos.y += (ty + bob - L.pos.y) * k + L.vel.y * dt;
      L.pos.z += (tz - L.pos.z) * k;
      g.position.copy(L.pos);
      const travel = Math.min(1, Math.hypot(tx - L.pos.x, ty - L.pos.y) / 4) + s * 0.6;
      if (!still) {
        L.rot.x = Math.sin(t * 0.6 + item.phase) * 0.18 + travel * 1.2 * item.spin;
        L.rot.y = Math.cos(t * 0.5 + item.phase) * 0.25 + travel * 1.6 * item.spin;
        L.rot.z = Math.sin(t * 0.4 + item.phase) * 0.12 + travel * item.spin;
      }
      g.rotation.copy(L.rot);
      g.scale.setScalar(item.base * item.size);
    });
  });

  return (
    <>
      <primitive object={line} />
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
  const shape = useRef<ShapeState>({ name: "bulb", tone: "ink" });
  const layer = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  // Sharp at the top of the page; it softens slightly as you scroll into the content.
  useEffect(() => {
    const onScroll = () => {
      const m = scrollMix();
      if (layer.current) {
        layer.current.style.filter = m > 0.01 ? `blur(${(m * 0.8).toFixed(2)}px)` : "none";
        layer.current.style.opacity = String(1 - m * 0.1);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready, path]);

  // Watch which section is in the middle of the screen and take its symbol (and its colour).
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const read = (el: HTMLElement): ShapeState => ({
      name: el.dataset.shape || "bulb",
      tone: el.classList.contains("sec--tangerine") ? "tangerine" : el.classList.contains("sec--paper") ? "paper" : "ink",
    });
    const start = window.setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-shape]"));
      if (els[0]) shape.current = read(els[0]);
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) shape.current = read(e.target as HTMLElement);
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
        <Field count={mobile ? 40 : 66} mobile={mobile} still={still} shape={shape} />
      </Canvas>
    </div>
  );
}
