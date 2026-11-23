"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { projects } from "@/data/site";

/* ── Palette (mirrors the CSS tokens) ─────────────────────── */
const C = {
  mask: "#0f3d2e",
  maskLight: "#15523d",
  edge: "#2f5d45",
  gold: "#d9b45a",
  goldHot: "#ffe08a",
  epoxy: "#141716",
  silk: "#f1eee3",
};

const BOARD_W = 12;
const BOARD_D = 7.6;
const BOARD_H = 0.16;
const TOP = BOARD_H / 2;

type V2 = [number, number];
type ChipSpec = { x: number; z: number; w: number; d: number; route: V2[] };

/* Where each project's chip sits and how its trace runs to the core (Manhattan routing). */
const LAYOUT: Record<string, ChipSpec> = {
  viralspy: { x: -3.6, z: -2.1, w: 2.2, d: 1.3, route: [[-2.5, -2.1], [-0.75, -2.1], [-0.75, -1.1]] },
  battlesnake: { x: 3.7, z: -2.1, w: 2.2, d: 1.3, route: [[2.6, -2.1], [0.75, -2.1], [0.75, -1.1]] },
  prodpath: { x: -4.4, z: 0.3, w: 1.7, d: 1.1, route: [[-3.55, 0.3], [-1.1, 0.3]] },
  resovault: { x: 4.4, z: 0.3, w: 1.7, d: 1.1, route: [[3.55, 0.3], [1.1, 0.3]] },
  econchain: { x: -3.4, z: 1.9, w: 2.0, d: 1.2, route: [[-2.4, 1.9], [-0.75, 1.9], [-0.75, 1.1]] },
  tillu: { x: 3.4, z: 1.9, w: 1.8, d: 1.2, route: [[2.5, 1.9], [0.75, 1.9], [0.75, 1.1]] },
  quicksewa: { x: -0.3, z: 2.85, w: 1.4, d: 0.9, route: [[-0.3, 2.4], [-0.3, 1.1]] },
  agrosense: { x: 0.25, z: -2.8, w: 1.4, d: 0.9, route: [[0.25, -2.35], [0.25, -1.1]] },
};

/* Decorative traces to the edge connector and board corners. */
const DECOR_TRACES: V2[][] = [
  [[1.1, 0.75], [2.1, 0.75], [2.1, 3.3]],
  [[1.1, -0.6], [1.7, -0.6], [1.7, -1.5], [5.6, -1.5]],
  [[-1.1, -0.6], [-1.8, -0.6], [-1.8, -3.4]],
  [[-1.1, 0.8], [-1.6, 0.8], [-1.6, 1.25], [-5.6, 1.25]],
];

/* Small passives (resistors / capacitors) scattered like a real layout. */
const PASSIVES: [number, number, number][] = [
  [-5.4, -3.2, 0], [-5.0, -3.2, 0], [-1.8, -3.0, 1], [1.6, -3.3, 0], [2.0, -3.3, 0],
  [5.4, -3.1, 1], [-5.4, -0.8, 1], [5.5, 1.3, 1], [-5.3, 3.2, 0], [-4.9, 3.2, 0],
  [1.5, 2.8, 1], [4.9, 3.25, 0], [-2.0, 0.0, 1], [2.0, -0.1, 1], [-1.6, 2.6, 1],
];

/* next/font renames families, so read the real names from the CSS variables. */
function F() {
  const s = getComputedStyle(document.documentElement);
  return {
    display: s.getPropertyValue("--font-display").trim() || "sans-serif",
    mono: s.getPropertyValue("--font-mono").trim() || "monospace",
  };
}

/* ── Canvas textures: silkscreen for the board and chip tops ─ */
function makeBoardTexture() {
  const W = 2400;
  const H = Math.round((W * BOARD_D) / BOARD_W);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const sx = W / BOARD_W;
  const toPx = (x: number, z: number): V2 => [(x + BOARD_W / 2) * sx, (z + BOARD_D / 2) * sx];

  // Solder mask with a faint copper-pour mottling.
  g.fillStyle = C.mask;
  g.fillRect(0, 0, W, H);
  const pour = g.createLinearGradient(0, 0, W, H);
  pour.addColorStop(0, "rgba(255,255,255,0.035)");
  pour.addColorStop(0.5, "rgba(0,0,0,0)");
  pour.addColorStop(1, "rgba(255,255,255,0.025)");
  g.fillStyle = pour;
  g.fillRect(0, 0, W, H);

  // Via field.
  for (let i = 0; i < 260; i++) {
    const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const y = ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1;
    g.beginPath();
    g.arc(x * W, y * H, 5, 0, Math.PI * 2);
    g.fillStyle = "rgba(217,180,90,0.55)";
    g.fill();
    g.beginPath();
    g.arc(x * W, y * H, 2, 0, Math.PI * 2);
    g.fillStyle = "#0a2a20";
    g.fill();
  }

  // Silkscreen footprints around every chip.
  g.strokeStyle = "rgba(241,238,227,0.75)";
  g.lineWidth = 3;
  for (const p of projects) {
    const s = LAYOUT[p.id];
    if (!s) continue;
    const [x, y] = toPx(s.x - s.w / 2 - 0.14, s.z - s.d / 2 - 0.2);
    g.strokeRect(x, y, (s.w + 0.28) * sx, (s.d + 0.4) * sx);
    g.font = `600 ${0.16 * sx}px ${F().mono}`;
    g.fillStyle = "rgba(241,238,227,0.85)";
    g.fillText(p.ref, x + 6, y - 10);
  }
  const [cx, cy] = toPx(-1.4, -1.4);
  g.strokeRect(cx, cy, 2.8 * sx, 2.8 * sx);

  // Board title block.
  g.fillStyle = "rgba(241,238,227,0.9)";
  g.font = `700 ${0.3 * sx}px ${F().display}`;
  g.fillText("BHUVAN THOTA", 0.35 * sx, BOARD_D * sx - 0.75 * sx);
  g.font = `500 ${0.13 * sx}px ${F().mono}`;
  g.fillText("PORTFOLIO  REV 2026  ·  BITS PILANI GOA", 0.36 * sx, BOARD_D * sx - 0.45 * sx);

  // Mounting holes.
  for (const [mx, mz] of [[-5.6, -3.4], [5.6, -3.4], [-5.6, 3.4], [5.6, 3.4]] as V2[]) {
    const [px, pz] = toPx(mx, mz);
    g.beginPath();
    g.arc(px, pz, 0.2 * sx, 0, Math.PI * 2);
    g.fillStyle = C.gold;
    g.fill();
    g.beginPath();
    g.arc(px, pz, 0.11 * sx, 0, Math.PI * 2);
    g.fillStyle = "#071d16";
    g.fill();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeChipTexture(title: string, ref: string, w: number, d: number, core = false) {
  const W = 1024;
  const H = Math.round((W * d) / w);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = C.epoxy;
  g.fillRect(0, 0, W, H);
  // Subtle moulded sheen.
  const sheen = g.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);
  // Pin-1 dimple.
  g.beginPath();
  g.arc(H * 0.16, H * 0.18, H * 0.07, 0, Math.PI * 2);
  g.fillStyle = "rgba(255,255,255,0.14)";
  g.fill();

  g.fillStyle = C.silk;
  g.textBaseline = "middle";
  if (core) {
    g.textAlign = "center";
    g.font = `800 ${H * 0.36}px ${F().display}`;
    g.fillText("BT", W / 2, H * 0.44);
    g.font = `500 ${H * 0.065}px ${F().mono}`;
    g.fillStyle = "rgba(241,238,227,0.7)";
    g.fillText("CORE · AI + PRODUCT", W / 2, H * 0.72);
  } else {
    g.textAlign = "left";
    let size = H * 0.3;
    g.font = `700 ${size}px ${F().display}`;
    while (g.measureText(title).width > W * 0.84 && size > 20) {
      size -= 4;
      g.font = `700 ${size}px ${F().display}`;
    }
    g.fillText(title, W * 0.08, H * 0.52);
    g.font = `500 ${H * 0.13}px ${F().mono}`;
    g.fillStyle = "rgba(241,238,227,0.6)";
    g.fillText(ref, W * 0.08, H * 0.8);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ── Pieces ───────────────────────────────────────────────── */
function polyline(route: V2[]) {
  const pts = route.map(([x, z]) => new THREE.Vector3(x, TOP + 0.008, z));
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = pts[i].distanceTo(pts[i - 1]);
    lens.push(l);
    total += l;
  }
  return { pts, lens, total };
}

function pointAt(line: ReturnType<typeof polyline>, t: number, out: THREE.Vector3) {
  let d = t * line.total;
  for (let i = 0; i < line.lens.length; i++) {
    if (d <= line.lens[i]) return out.lerpVectors(line.pts[i], line.pts[i + 1], d / line.lens[i]);
    d -= line.lens[i];
  }
  return out.copy(line.pts[line.pts.length - 1]);
}

function Trace({ route, active, decor = false, still }: { route: V2[]; active: boolean; decor?: boolean; still: boolean }) {
  const line = useMemo(() => polyline(route), [route]);
  // One material shared by every segment of this trace, so the whole run lights up together.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: C.gold,
        metalness: 0.85,
        roughness: 0.3,
        emissive: new THREE.Color(C.goldHot),
        emissiveIntensity: 0.18,
      }),
    []
  );
  const mat = useRef(material);
  const pulses = useRef<(THREE.Group | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const count = decor ? 1 : 2;

  useFrame((state, dt) => {
    if (mat.current) {
      const target = active ? 1.1 : decor ? 0.05 : 0.18;
      mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, target, 8, dt);
    }
    const speed = active ? 0.55 : 0.16;
    pulses.current.forEach((p, i) => {
      if (!p) return;
      const t = still ? (i + 0.5) / count : (state.clock.elapsedTime * speed * (decor ? 0.6 : 1) + i / count) % 1;
      pointAt(line, t, tmp);
      p.position.set(tmp.x, tmp.y + 0.03, tmp.z);
      const s = active ? 1.35 : 1;
      p.scale.setScalar(THREE.MathUtils.damp(p.scale.x, s, 10, dt));
    });
  });

  return (
    <group>
      {line.pts.slice(1).map((b, i) => {
        const a = line.pts[i];
        const len = a.distanceTo(b);
        const horizontal = Math.abs(a.z - b.z) < 1e-6;
        return (
          <mesh key={i} position={[(a.x + b.x) / 2, TOP + 0.006, (a.z + b.z) / 2]} material={material} receiveShadow>
            <boxGeometry args={horizontal ? [len + 0.08, 0.012, 0.08] : [0.08, 0.012, len + 0.08]} />
          </mesh>
        );
      })}
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} ref={(el) => { pulses.current[i] = el; }}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#fff6d6" toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color={C.goldHot} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pins({ w, d }: { w: number; d: number }) {
  const n = Math.max(3, Math.floor(w / 0.24));
  const step = w / n;
  const pins: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + step * (i + 0.5);
    pins.push([x, -d / 2 - 0.07], [x, d / 2 + 0.07]);
  }
  return (
    <>
      {pins.map(([x, z], i) => (
        <mesh key={i} position={[x, -0.07, z]} castShadow>
          <boxGeometry args={[0.07, 0.05, 0.18]} />
          <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </>
  );
}

function Chip({
  id,
  title,
  refDes,
  spec,
  hovered,
  onHover,
  onSelect,
  core = false,
}: {
  id: string;
  title: string;
  refDes: string;
  spec: { x: number; z: number; w: number; d: number };
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect?: (id: string) => void;
  core?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeChipTexture(title, refDes, spec.w, spec.d, core), [title, refDes, spec.w, spec.d, core]);
  const H = core ? 0.3 : 0.22;

  useFrame((_, dt) => {
    if (!group.current) return;
    const y = TOP + H / 2 + 0.04 + (hovered ? 0.16 : 0);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, y, 10, dt);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(id);
    document.body.style.cursor = onSelect ? "pointer" : "default";
  };
  const out = () => {
    onHover(null);
    document.body.style.cursor = "";
  };

  return (
    <group ref={group} position={[spec.x, TOP + H / 2 + 0.04, spec.z]}>
      <mesh
        castShadow
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <boxGeometry args={[spec.w, H, spec.d]} />
        <meshStandardMaterial attach="material-0" color={C.epoxy} roughness={0.55} />
        <meshStandardMaterial attach="material-1" color={C.epoxy} roughness={0.55} />
        <meshStandardMaterial attach="material-2" map={tex} roughness={0.42} metalness={0.05} emissive={hovered ? "#2a2412" : "#000000"} />
        <meshStandardMaterial attach="material-3" color={C.epoxy} roughness={0.55} />
        <meshStandardMaterial attach="material-4" color={C.epoxy} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={C.epoxy} roughness={0.55} />
      </mesh>
      <Pins w={spec.w} d={spec.d} />
    </group>
  );
}

function Board({ still }: { still: boolean }) {
  const tex = useMemo(() => makeBoardTexture(), []);
  return (
    <>
      <mesh receiveShadow>
        <boxGeometry args={[BOARD_W, BOARD_H, BOARD_D]} />
        <meshStandardMaterial attach="material-0" color={C.edge} roughness={0.8} />
        <meshStandardMaterial attach="material-1" color={C.edge} roughness={0.8} />
        <meshStandardMaterial attach="material-2" map={tex} roughness={0.5} metalness={0.1} />
        <meshStandardMaterial attach="material-3" color={C.edge} roughness={0.8} />
        <meshStandardMaterial attach="material-4" color={C.edge} roughness={0.8} />
        <meshStandardMaterial attach="material-5" color={C.edge} roughness={0.8} />
      </mesh>
      {/* Edge connector fingers */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[2.3 + i * 0.24, TOP + 0.004, BOARD_D / 2 - 0.3]} receiveShadow>
          <boxGeometry args={[0.14, 0.008, 0.5]} />
          <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {PASSIVES.map(([x, z, r], i) => (
        <group key={i} position={[x, TOP + 0.05, z]} rotation={[0, r * Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.09, 0.13]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#3b2f22" : "#151716"} roughness={0.6} />
          </mesh>
          {[-0.14, 0.14].map((ex) => (
            <mesh key={ex} position={[ex, 0, 0]}>
              <boxGeometry args={[0.06, 0.1, 0.14]} />
              <meshStandardMaterial color="#cfd2cf" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Status LED */}
      <mesh position={[5.3, TOP + 0.06, -2.4]}>
        <boxGeometry args={[0.2, 0.1, 0.12]} />
        <meshBasicMaterial color="#ff6a3d" toneMapped={false} />
      </mesh>
      {!still && <LedGlow />}
    </>
  );
}

function LedGlow() {
  const m = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((s) => {
    if (m.current) m.current.opacity = 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 2.2));
  });
  return (
    <mesh position={[5.3, TOP + 0.07, -2.4]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial ref={m} color="#ff6a3d" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/* Frames the board for the canvas' aspect ratio and adds the entrance + pointer parallax. */
function Rig({ children, still }: { children: React.ReactNode; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  // Only shift the board right when the hero copy overlays it (desktop layout).
  const wide = aspect > 1.25 && size.width > 720;
  const born = useRef<number | null>(null);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const span = wide ? BOARD_W + 11.5 : BOARD_W + 0.6;
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect;
    const dist = Math.max(span / 2 / tanH, 8);
    const dir = (aspect < 1.1 ? new THREE.Vector3(0, 0.92, 0.4) : new THREE.Vector3(0, 0.8, 0.6)).normalize();
    cam.position.copy(dir.multiplyScalar(dist));
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, aspect, wide]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - born.current;
    const intro = still ? 1 : 1 - Math.pow(1 - Math.min(age / 1.6, 1), 4);
    const px = still ? 0 : state.pointer.x;
    const py = still ? 0 : state.pointer.y;
    g.position.x = wide ? 5.3 : 0;
    g.position.y = (1 - intro) * -2.2;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, (1 - intro) * 0.5 - py * 0.05, 6, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (1 - intro) * -0.35 + px * 0.08, 6, dt);
  });

  return <group ref={group}>{children}</group>;
}

function Scene({
  hovered,
  setHovered,
  onSelect,
  still,
  touch,
}: {
  hovered: string | null;
  setHovered: (id: string | null) => void;
  onSelect: (id: string) => void;
  still: boolean;
  touch: boolean;
}) {
  const coreHot = hovered === "core";
  return (
    <>
      <hemisphereLight args={["#fff7e6", "#0b2a20", 0.9]} />
      <directionalLight
        position={[5, 10, 4]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, -4]} intensity={18} color="#ffd98a" distance={18} />
      <Rig still={still}>
        <Board still={still} />
        {projects.map((p) => {
          const s = LAYOUT[p.id];
          return s ? (
            <Trace key={`t-${p.id}`} route={s.route} active={hovered === p.id || coreHot} still={still} />
          ) : null;
        })}
        {DECOR_TRACES.map((r, i) => (
          <Trace key={`d-${i}`} route={r} active={coreHot} decor still={still} />
        ))}
        {projects.map((p) => {
          const s = LAYOUT[p.id];
          return s ? (
            <Chip
              key={p.id}
              id={p.id}
              title={p.title}
              refDes={p.ref}
              spec={s}
              hovered={hovered === p.id}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ) : null;
        })}
        <Chip id="core" title="BT" refDes="U0" spec={{ x: 0, z: 0, w: 2.2, d: 2.2 }} hovered={coreHot} onHover={setHovered} core />
      </Rig>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!touch}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.35}
        maxPolarAngle={1.05}
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.6}
        rotateSpeed={0.5}
      />
    </>
  );
}

export default function Board3D({
  hovered,
  setHovered,
  onSelect,
}: {
  hovered: string | null;
  setHovered: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const [still, setStill] = useState(false);
  const [touch, setTouch] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    // Textures paint text onto canvases, so wait for the web fonts first.
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  if (!fontsReady) return null;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.1, far: 100, position: [0, 12, 9] }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
      onPointerMissed={() => setHovered(null)}
      aria-hidden
    >
      <Scene hovered={hovered} setHovered={setHovered} onSelect={onSelect} still={still} touch={touch} />
    </Canvas>
  );
}
