"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { samplePoints } from "./symbols";

/* Palette: ink + tangerine + off-white */
const INK = "#0d1321";
const INK2 = "#1c2742";
const TAN = "#ff6b2c";
const PAPER = "#f2f4f7";

/* ── Icon glyphs (AI, product, software), drawn as line art on a canvas ── */
type Draw = (g: CanvasRenderingContext2D) => void;
const GLYPHS: Record<string, Draw> = {
  sparkle: (g) => {
    const star = (x: number, y: number, r: number) => {
      g.beginPath();
      g.moveTo(x, y - r);
      g.quadraticCurveTo(x, y, x + r, y);
      g.quadraticCurveTo(x, y, x, y + r);
      g.quadraticCurveTo(x, y, x - r, y);
      g.quadraticCurveTo(x, y, x, y - r);
      g.fill();
    };
    star(112, 140, 72);
    star(186, 70, 30);
  },
  neural: (g) => {
    const L = [[64, 70], [64, 128], [64, 186]];
    const R = [[192, 96], [192, 160]];
    L.forEach((a) => R.forEach((b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }));
    [...L, ...R].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); });
  },
  chat: (g) => {
    g.beginPath();
    g.roundRect(40, 52, 176, 120, 28);
    g.moveTo(84, 172);
    g.lineTo(70, 214);
    g.lineTo(122, 172);
    g.stroke();
    [92, 128, 164].forEach((x) => { g.beginPath(); g.arc(x, 112, 11, 0, 7); g.fill(); });
  },
  code: (g) => {
    g.beginPath();
    g.moveTo(92, 72); g.lineTo(40, 128); g.lineTo(92, 184);
    g.moveTo(164, 72); g.lineTo(216, 128); g.lineTo(164, 184);
    g.moveTo(144, 56); g.lineTo(112, 200);
    g.stroke();
  },
  terminal: (g) => {
    g.beginPath();
    g.roundRect(36, 52, 184, 152, 20);
    g.moveTo(70, 100); g.lineTo(106, 128); g.lineTo(70, 156);
    g.moveTo(124, 160); g.lineTo(180, 160);
    g.stroke();
  },
  branch: (g) => {
    g.beginPath();
    g.moveTo(80, 60); g.lineTo(80, 196);
    g.moveTo(80, 160); g.bezierCurveTo(80, 120, 176, 130, 176, 92);
    g.stroke();
    [[80, 60], [80, 196], [176, 80]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill(); });
  },
  database: (g) => {
    g.beginPath();
    g.ellipse(128, 70, 76, 26, 0, 0, 7);
    g.moveTo(52, 70); g.lineTo(52, 186);
    g.moveTo(204, 70); g.lineTo(204, 186);
    g.stroke();
    [128, 186].forEach((y) => { g.beginPath(); g.ellipse(128, y, 76, 26, 0, 0, Math.PI); g.stroke(); });
  },
  target: (g) => {
    [84, 52, 20].forEach((r, i) => { g.beginPath(); g.arc(128, 128, r, 0, 7); if (i === 2) g.fill(); else g.stroke(); });
  },
  bulb: (g) => {
    g.beginPath();
    g.arc(128, 104, 58, Math.PI * 0.8, Math.PI * 2.2);
    g.lineTo(156, 176); g.lineTo(100, 176); g.closePath();
    g.moveTo(104, 204); g.lineTo(152, 204);
    g.stroke();
  },
  kanban: (g) => {
    [[44, 3], [104, 2], [164, 1]].forEach(([x, n]) => {
      for (let i = 0; i < n; i++) { g.beginPath(); g.roundRect(x, 52 + i * 52, 48, 40, 10); g.fill(); }
    });
  },
  chart: (g) => {
    [[52, 150, 54], [100, 120, 84], [148, 96, 108]].forEach(([x, y, h]) => { g.beginPath(); g.roundRect(x, y, 34, h, 6); g.fill(); });
    g.beginPath(); g.moveTo(44, 120); g.lineTo(108, 76); g.lineTo(150, 96); g.lineTo(212, 48); g.stroke();
  },
  flag: (g) => {
    g.beginPath(); g.moveTo(72, 212); g.lineTo(72, 44); g.stroke();
    g.beginPath(); g.moveTo(72, 48); g.lineTo(200, 80); g.lineTo(72, 124); g.closePath(); g.fill();
  },
  user: (g) => {
    g.beginPath(); g.arc(128, 92, 40, 0, 7); g.stroke();
    g.beginPath(); g.arc(128, 220, 76, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  },
  check: (g) => {
    g.beginPath(); g.arc(128, 128, 84, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(88, 130); g.lineTo(116, 158); g.lineTo(170, 100); g.stroke();
  },
};
const GLYPH_NAMES = Object.keys(GLYPHS);

/* Tile styles: [body colour, glyph colour] */
const STYLES: [string, string][] = [
  [INK2, PAPER],
  [PAPER, INK],
  [TAN, INK],
  [INK2, TAN],
];

function glyphTexture(name: string, color: string) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 16;
  g.lineCap = "round";
  g.lineJoin = "round";
  GLYPHS[name](g);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Tile = { glyph: string; style: number; size: number; depth: number; phase: number; spin: number };

function Field({ count, mobile, still, shape }: { count: number; mobile: boolean; still: boolean; shape: React.MutableRefObject<string> }) {
  const { camera, size } = useThree();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const pointer = useRef(new THREE.Vector2(99, 99));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 5.5), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const tiles = useMemo<Tile[]>(() => {
    const r = rng(23);
    return Array.from({ length: count }, (_, i) => ({
      glyph: GLYPH_NAMES[i % GLYPH_NAMES.length],
      style: Math.floor(r() * STYLES.length),
      size: (mobile ? 0.62 : 0.8) + r() * 0.3,
      depth: -7 + r() * 3.5,
      phase: r() * 10,
      spin: (r() - 0.5) * 0.8,
    }));
  }, [count, mobile]);

  const textures = useMemo(() => {
    const m = new Map<string, THREE.Texture>();
    tiles.forEach((t) => {
      const key = `${t.glyph}-${STYLES[t.style][1]}`;
      if (!m.has(key)) m.set(key, glyphTexture(t.glyph, STYLES[t.style][1]));
    });
    return m;
  }, [tiles]);

  const live = useMemo(
    () => tiles.map((_, i) => ({ pos: new THREE.Vector3(Math.sin(i * 7.3) * 16, Math.cos(i * 3.1) * 11, -9), vel: new THREE.Vector3(), rot: new THREE.Euler() })),
    [tiles]
  );
  const targets = useRef<THREE.Vector3[]>([]);
  const lastKey = useRef("");
  // A fixed shuffle so neighbouring tiles in a symbol show different icons.
  const shuffle = useMemo(() => {
    const r = rng(5);
    const idx = tiles.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [tiles]);

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

    // Rebuild the targets when the section (and so the symbol) or the screen size changes.
    const key = `${shape.current}-${size.width}x${size.height}`;
    if (key !== lastKey.current) {
      lastKey.current = key;
      const dist = cam.position.z + 5.5;
      const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const visW = visH * (size.width / size.height);
      const scale = mobile ? Math.min(visW * 0.36, visH * 0.22) : visH * 0.34;
      const cx = mobile ? 0 : visW * 0.24;
      const cy = mobile ? visH * 0.12 : -visH * 0.02;
      const pts = samplePoints(shape.current, tiles.length);
      const byTile: THREE.Vector3[] = new Array(tiles.length);
      shuffle.forEach((tileIndex, k) => {
        const [x, y] = pts[k];
        byTile[tileIndex] = new THREE.Vector3(cx + x * scale, cy + y * scale, tiles[tileIndex].depth);
      });
      targets.current = byTile;
    }

    let pointerOn = false;
    if (!mobile && Math.abs(pointer.current.x) <= 1) {
      ray.setFromCamera(pointer.current, cam);
      pointerOn = !!ray.ray.intersectPlane(plane, hit);
    }

    tiles.forEach((tile, i) => {
      const g = groups.current[i];
      const target = targets.current[i];
      if (!g || !target) return;
      const L = live[i];
      // The cursor pushes tiles away; they drift back into the symbol.
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
      // Each tile has its own pace, so symbols assemble in a ripple rather than all at once.
      const k = 1 - Math.exp(-dt * (1.5 + (i % 7) * 0.18));
      const bob = still ? 0 : Math.sin(t * 0.8 + tile.phase) * 0.08;
      L.pos.x += (target.x - L.pos.x) * k + L.vel.x * dt;
      L.pos.y += (target.y + bob - L.pos.y) * k + L.vel.y * dt;
      L.pos.z += (target.z - L.pos.z) * k;
      g.position.copy(L.pos);
      // Face the viewer with a little life; tiles in motion tumble a bit.
      const travel = Math.min(1, L.pos.distanceTo(target) / 4);
      if (!still) {
        L.rot.x = Math.sin(t * 0.6 + tile.phase) * 0.18 + travel * 1.2 * tile.spin;
        L.rot.y = Math.cos(t * 0.5 + tile.phase) * 0.22 + travel * 1.6 * tile.spin;
        L.rot.z = travel * tile.spin;
      }
      g.rotation.copy(L.rot);
      g.scale.setScalar(tile.size);
    });
  });

  return (
    <>
      {tiles.map((tile, i) => {
        const [body, ink] = STYLES[tile.style];
        return (
          <group key={i} ref={(g) => { groups.current[i] = g; }}>
            <RoundedBox args={[1, 1, 0.22]} radius={0.2} smoothness={4}>
              <meshPhysicalMaterial color={body} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.25} />
            </RoundedBox>
            <mesh position={[0, 0, 0.115]}>
              <planeGeometry args={[0.66, 0.66]} />
              <meshBasicMaterial map={textures.get(`${tile.glyph}-${ink}`)} transparent toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export default function Artifacts3D() {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [still, setStill] = useState(false);
  const shape = useRef("bulb");
  const path = usePathname();

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

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
    <div className="artifacts" aria-hidden>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 38, position: [0, 0, 22], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 8]} intensity={1.4} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 6]} scale={[14, 4, 1]} />
          <Lightformer intensity={1.2} color={TAN} position={[8, -2, 4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer intensity={0.8} color={PAPER} position={[-8, 0, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        </Environment>
        <Field count={mobile ? 26 : 44} mobile={mobile} still={still} shape={shape} />
      </Canvas>
    </div>
  );
}
