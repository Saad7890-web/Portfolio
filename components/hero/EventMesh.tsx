'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Plane,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from 'three';
import type { Pillar } from '@/content/types';
import { usePalette, type Palette } from './palette';
import type { PointerField } from './types';
import {
  ANCHORS,
  EDGES,
  EDGE_POOL,
  HOT_NODES,
  LAYOUTS,
  NODE_COUNT,
  PACKET_COUNT,
  SCENES,
} from './scene';

/**
 * The hero event-mesh. One graph of 40 nodes and ~90 edges with packets
 * travelling the edges; the Role Lens moves the nodes to a new layout and
 * changes which edges the packets prefer, so the same system is re-read rather
 * than replaced.
 *
 * This whole module is a separate chunk, imported only after first paint and
 * only on devices that passed the capability check in lib/perf.
 */

const FOV = 40;
/** Half-extent the camera must frame: the widest layout plus its drift. */
const MESH_EXTENT = 4.5;

/** Spring pulling each node to its layout position. */
const STIFFNESS = 9;
const DAMPING = 3.6;

/** Cursor repulsion field. */
const FIELD_RADIUS = 2.7;
const FIELD_PUSH = 30;

const NODE_R = 0.075;
const HOT_R = 0.115;
/** Plane size for a packet sprite. Most of it is the falloff, not the core. */
const PACKET_SPRITE = 0.44;

const WAVE_SPEED = 0.42;

interface EventMeshProps {
  lens: Pillar;
  /** In view and in a visible tab. False parks the render loop entirely. */
  active: boolean;
  pointer: RefObject<PointerField>;
  /** Label elements owned by the wrapper; positioned here, once per frame. */
  labels: RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
}

export default function EventMesh({ lens, active, pointer, labels, onReady }: EventMeshProps) {
  const palette = usePalette();

  return (
    <Canvas
      // NoToneMapping. The instrument-panel palette is authored in sRGB and
      // should reach the screen as authored, not through a filmic curve.
      flat
      dpr={[1, 1.75]}
      // 'demand' is the pause: nothing renders unless something asks for it.
      frameloop={active ? 'always' : 'demand'}
      gl={{
        antialias: false,
        alpha: true,
        stencil: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      }}
      camera={{ position: [0, 0, 14], fov: FOV, near: 1, far: 40 }}
      style={{ pointerEvents: 'none' }}
    >
      <Graph lens={lens} palette={palette} pointer={pointer} labels={labels} onReady={onReady} />
      <AdaptiveQuality />
    </Canvas>
  );
}

// ---------------------------------------------------------------------------

/** A soft radial falloff, generated rather than fetched. */
function makeGlowTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.16, 'rgba(255,255,255,0.92)');
  gradient.addColorStop(0.34, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Resolution that answers to measured frame time.
 *
 * drei's <AdaptiveDpr> only reacts to explicit `regress()` calls, which come
 * from the pointer-event system this canvas does not use — it would have been
 * a no-op here, and drei's barrel costs more gzip than the entire scene. This
 * watches real frames instead and steps the DPR with hysteresis so it settles
 * rather than oscillating.
 */
function AdaptiveQuality() {
  const setDpr = useThree((state) => state.setDpr);
  const ceiling = useThree((state) => state.viewport.initialDpr);
  const window = useRef({ elapsed: 0, frames: 0, dpr: 0 });

  useFrame((_, delta) => {
    const w = window.current;
    if (w.dpr === 0) w.dpr = ceiling;

    w.elapsed += delta;
    w.frames += 1;
    if (w.elapsed < 1) return;

    const fps = w.frames / w.elapsed;
    w.elapsed = 0;
    w.frames = 0;

    // Wide dead band: anything between the two thresholds is left alone.
    const next =
      fps < 45 ? Math.max(0.85, w.dpr - 0.25) : fps > 57 ? Math.min(ceiling, w.dpr + 0.25) : w.dpr;

    if (next !== w.dpr) {
      w.dpr = next;
      setDpr(next);
    }
  });

  return null;
}

// ---------------------------------------------------------------------------

interface Sim {
  pos: Float32Array;
  vel: Float32Array;
  /** Per-node drift phase and amplitude, so no two nodes breathe together. */
  driftPhase: Float32Array;
  driftAmp: Float32Array;
  edgePos: Float32Array;
  packetEdge: Int32Array;
  packetT: Float32Array;
  packetSpeed: Float32Array;
  packetDir: Int8Array;
  /** Fixed 0..1 offset used by the platform lens to hold packets in formation. */
  packetPhase: Float32Array;
  /** Previous wave position, for detecting the wrap that respawns a packet. */
  packetPrev: Float32Array;
  waveClock: number;
  colorTarget: Float32Array;
}

function createSim(lens: Pillar): Sim {
  const pos = new Float32Array(NODE_COUNT * 3);
  const layout = LAYOUTS[lens];
  for (let i = 0; i < NODE_COUNT; i++) {
    const p = layout[i]!;
    pos[i * 3] = p[0];
    pos[i * 3 + 1] = p[1];
    pos[i * 3 + 2] = p[2];
  }

  const driftPhase = new Float32Array(NODE_COUNT);
  const driftAmp = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    driftPhase[i] = (i * 2.399963) % (Math.PI * 2);
    driftAmp[i] = 0.09 + ((i * 37) % 11) * 0.011;
  }

  const pool = EDGE_POOL[lens];
  const packetEdge = new Int32Array(PACKET_COUNT);
  const packetT = new Float32Array(PACKET_COUNT);
  const packetSpeed = new Float32Array(PACKET_COUNT);
  const packetDir = new Int8Array(PACKET_COUNT);
  const packetPhase = new Float32Array(PACKET_COUNT);
  const packetPrev = new Float32Array(PACKET_COUNT);

  for (let p = 0; p < PACKET_COUNT; p++) {
    packetEdge[p] = pool[(p * 7) % pool.length]!;
    packetT[p] = ((p * 13) % 100) / 100;
    packetSpeed[p] = 0.3 + ((p * 17) % 9) * 0.032;
    packetDir[p] = 1;
    // Four groups — the platform lens reads as four distinct deploy waves.
    packetPhase[p] = (p % 4) / 4;
  }

  return {
    pos,
    vel: new Float32Array(NODE_COUNT * 3),
    driftPhase,
    driftAmp,
    edgePos: new Float32Array(EDGES.length * 2 * 3),
    packetEdge,
    packetT,
    packetSpeed,
    packetDir,
    packetPhase,
    packetPrev,
    waveClock: 0,
    colorTarget: new Float32Array(NODE_COUNT * 3),
  };
}

interface GraphProps {
  lens: Pillar;
  palette: Palette;
  pointer: RefObject<PointerField>;
  labels: RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
}

function Graph({ lens, palette, pointer, labels, onReady }: GraphProps) {
  const { camera, size, invalidate } = useThree();

  // Frame the mesh to the canvas it actually got, not to an assumed square:
  // a tall narrow column and a wide one must both hold the whole graph.
  const distance = useMemo(() => {
    const half = Math.tan((FOV * Math.PI) / 360);
    const aspect = Math.max(0.4, size.width / Math.max(1, size.height));
    return Math.max(MESH_EXTENT / half, MESH_EXTENT / (half * aspect));
  }, [size.width, size.height]);

  useEffect(() => {
    camera.position.z = distance;
    invalidate();
  }, [camera, distance, invalidate]);

  // Captured at mount so the mesh opens already settled in the URL's lens,
  // rather than flying into position on arrival.
  const initialLens = useRef(lens);
  const sim = useMemo(() => createSim(initialLens.current), []);

  const scratch = useMemo(
    () => ({
      dummy: new Object3D(),
      raycaster: new Raycaster(),
      ndc: new Vector2(),
      cursor: new Vector3(),
      projected: new Vector3(),
      plane: new Plane(new Vector3(0, 0, 1), 0),
      /** Eased cursor strength — a hard 0 on pointer-leave snaps the mesh back. */
      field: 0,
      painted: false,
    }),
    [],
  );

  const nodes = useMemo(() => {
    const mesh = new InstancedMesh(
      new IcosahedronGeometry(1, 1),
      new MeshBasicMaterial({ vertexColors: true }),
      NODE_COUNT,
    );
    mesh.frustumCulled = false;
    return mesh;
  }, []);

  /**
   * Packets glow without a postprocessing pass. A threshold bloom would have
   * meant shipping the `postprocessing` bundle — 153KB gzip, more than three
   * itself, for one effect — so instead each packet is an additively blended
   * sprite with a generated radial falloff. It is selective by construction
   * (nothing else uses the material) and costs one 64px canvas texture.
   *
   * The camera never rotates, so an XY plane is always camera-facing; no
   * billboarding maths is needed.
   */
  const packets = useMemo(() => {
    const mesh = new InstancedMesh(
      new PlaneGeometry(PACKET_SPRITE, PACKET_SPRITE),
      new MeshBasicMaterial({
        map: makeGlowTexture(),
        transparent: true,
        depthWrite: false,
      }),
      PACKET_COUNT,
    );
    mesh.frustumCulled = false;
    return mesh;
  }, []);

  const edges = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(sim.edgePos, 3));
    const line = new LineSegments(geometry, new LineBasicMaterial({ transparent: true }));
    line.frustumCulled = false;
    return line;
  }, [sim.edgePos]);

  // three owns GPU memory; React does not free it for us.
  useEffect(
    () => () => {
      [nodes, packets, edges].forEach((object) => {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => {
          if (m instanceof MeshBasicMaterial) m.map?.dispose();
          m.dispose();
        });
      });
      nodes.dispose();
      packets.dispose();
    },
    [nodes, packets, edges],
  );

  // Colours come from CSS, so they change with the theme, not with the lens
  // alone. The per-node target is what the frame loop eases toward.
  useEffect(() => {
    const hot = HOT_NODES[lens];
    for (let i = 0; i < NODE_COUNT; i++) {
      const color = hot.has(i) ? palette.accent : palette.node;
      sim.colorTarget[i * 3] = color.r;
      sim.colorTarget[i * 3 + 1] = color.g;
      sim.colorTarget[i * 3 + 2] = color.b;
      if (!nodes.instanceColor) nodes.setColorAt(i, color);
    }
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;

    const packetMaterial = packets.material as MeshBasicMaterial;
    packetMaterial.color.copy(palette.packet);
    packetMaterial.blending = palette.dark ? AdditiveBlending : NormalBlending;
    packetMaterial.needsUpdate = true;
    const edgeMaterial = edges.material as LineBasicMaterial;
    edgeMaterial.color.copy(palette.edge);
    edgeMaterial.opacity = palette.dark ? 0.5 : 0.7;

    invalidate();
  }, [lens, palette, sim, nodes, packets, edges, invalidate]);

  useFrame((state, rawDelta) => {
    // Clamp: a tab that was parked or a long GC must not detonate the spring.
    const dt = Math.min(rawDelta, 1 / 30);
    const time = state.clock.elapsedTime;

    const layout = LAYOUTS[lens];
    const hot = HOT_NODES[lens];
    const mode = SCENES[lens].packets;
    const pool = EDGE_POOL[lens];

    const { dummy, raycaster, ndc, cursor, projected, plane } = scratch;
    const field = pointer.current;

    scratch.field += (field.strength - scratch.field) * Math.min(1, dt * 5);
    const strength = scratch.field;

    // Cursor repulsion is a raycast onto the z = 0 plane, not a screen-space
    // hack: the field then has the same depth as the mesh it is pushing.
    let hasCursor = false;
    if (strength > 0.002) {
      ndc.set(field.x, field.y);
      raycaster.setFromCamera(ndc, camera);
      hasCursor = raycaster.ray.intersectPlane(plane, cursor) !== null;
    }

    const damp = Math.exp(-DAMPING * dt);
    const { pos, vel } = sim;

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      const target = layout[i]!;

      // Slow autonomous drift, phase-shifted per node.
      const phase = sim.driftPhase[i]!;
      const amp = sim.driftAmp[i]!;
      const tx = target[0] + Math.sin(time * 0.31 + phase) * amp;
      const ty = target[1] + Math.cos(time * 0.27 + phase * 1.7) * amp;
      const tz = target[2] + Math.sin(time * 0.23 + phase * 0.6) * amp;

      let vx = vel[i3]! + (tx - pos[i3]!) * STIFFNESS * dt;
      let vy = vel[i3 + 1]! + (ty - pos[i3 + 1]!) * STIFFNESS * dt;
      let vz = vel[i3 + 2]! + (tz - pos[i3 + 2]!) * STIFFNESS * dt;

      if (hasCursor) {
        const rx = pos[i3]! - cursor.x;
        const ry = pos[i3 + 1]! - cursor.y;
        const rz = pos[i3 + 2]! - cursor.z;
        const d2 = rx * rx + ry * ry + rz * rz;
        if (d2 < FIELD_RADIUS * FIELD_RADIUS) {
          const d = Math.sqrt(d2) || 1e-4;
          const falloff = (1 - d / FIELD_RADIUS) ** 2;
          const push = (falloff * FIELD_PUSH * strength * dt) / d;
          vx += rx * push;
          vy += ry * push;
          vz += rz * push;
        }
      }

      vx *= damp;
      vy *= damp;
      vz *= damp;
      vel[i3] = vx;
      vel[i3 + 1] = vy;
      vel[i3 + 2] = vz;

      const px = (pos[i3] = pos[i3]! + vx * dt);
      const py = (pos[i3 + 1] = pos[i3 + 1]! + vy * dt);
      const pz = (pos[i3 + 2] = pos[i3 + 2]! + vz * dt);

      const isHot = hot.has(i);
      const radius = isHot ? HOT_R * (1 + Math.sin(time * 1.7 + i) * 0.09) : NODE_R;
      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(radius);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    }
    nodes.instanceMatrix.needsUpdate = true;

    // Ease colours rather than cutting them, so a lens change is one motion.
    const colors = nodes.instanceColor;
    if (colors) {
      const array = colors.array as Float32Array;
      const k = Math.min(1, dt * 4.5);
      for (let c = 0; c < NODE_COUNT * 3; c++) {
        array[c] = array[c]! + (sim.colorTarget[c]! - array[c]!) * k;
      }
      colors.needsUpdate = true;
    }

    for (let e = 0; e < EDGES.length; e++) {
      const [a, b] = EDGES[e]!;
      const o = e * 6;
      sim.edgePos[o] = pos[a * 3]!;
      sim.edgePos[o + 1] = pos[a * 3 + 1]!;
      sim.edgePos[o + 2] = pos[a * 3 + 2]!;
      sim.edgePos[o + 3] = pos[b * 3]!;
      sim.edgePos[o + 4] = pos[b * 3 + 1]!;
      sim.edgePos[o + 5] = pos[b * 3 + 2]!;
    }
    edges.geometry.attributes.position!.needsUpdate = true;

    sim.waveClock = (sim.waveClock + WAVE_SPEED * dt) % 1;

    for (let p = 0; p < PACKET_COUNT; p++) {
      let respawn = false;

      if (mode === 'wave') {
        // One clock, four phase groups: the fleet updates in visible waves.
        const t = (sim.waveClock + sim.packetPhase[p]!) % 1;
        respawn = t < sim.packetPrev[p]!;
        sim.packetPrev[p] = t;
        sim.packetT[p] = t;
      } else {
        const t = sim.packetT[p]! + sim.packetSpeed[p]! * sim.packetDir[p]! * dt;
        if (t > 1 || t < 0) {
          respawn = true;
          sim.packetT[p] = t > 1 ? 1 : 0;
        } else {
          sim.packetT[p] = t;
        }
      }

      if (respawn) {
        sim.packetEdge[p] = pool[Math.floor((p * 31 + time * 7.3) % pool.length)]!;
        if (mode === 'inference') {
          // Alternate: a prompt travels in to the hub, tokens travel back out.
          const dir = (sim.packetDir[p]! * -1) as -1 | 1;
          sim.packetDir[p] = dir;
          sim.packetT[p] = dir === 1 ? 0 : 1;
        } else {
          sim.packetDir[p] = 1;
          sim.packetT[p] = mode === 'wave' ? sim.packetT[p]! : 0;
        }
        sim.packetPrev[p] = sim.packetT[p]!;
      }

      const [a, b] = EDGES[sim.packetEdge[p]!]!;
      const t = sim.packetT[p]!;
      const a3 = a * 3;
      const b3 = b * 3;
      dummy.position.set(
        pos[a3]! + (pos[b3]! - pos[a3]!) * t,
        pos[a3 + 1]! + (pos[b3 + 1]! - pos[a3 + 1]!) * t,
        pos[a3 + 2]! + (pos[b3 + 2]! - pos[a3 + 2]!) * t,
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      packets.setMatrixAt(p, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;

    // Labels are DOM, not 3D text: crisp at any DPR, themed by CSS, and it
    // keeps troika's font pipeline out of the bundle entirely.
    const elements = labels.current;
    if (elements) {
      for (let i = 0; i < ANCHORS.length; i++) {
        const el = elements[i];
        if (!el) continue;
        const node = ANCHORS[i]! * 3;
        projected.set(pos[node]!, pos[node + 1]!, pos[node + 2]!).project(camera);
        const x = (projected.x * 0.5 + 0.5) * size.width;
        const y = (-projected.y * 0.5 + 0.5) * size.height;
        // Fade with real depth, so labels behind the mesh recede with it.
        const depth = (pos[node + 2]! + 3.6) / 7.2;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = (0.45 + Math.max(0, Math.min(1, depth)) * 0.55).toFixed(2);
      }
    }

    // Hand over from the SVG mesh only once there is a real frame to hand to.
    if (!scratch.painted) {
      scratch.painted = true;
      onReady();
    }
  });

  return (
    <>
      {/* Depth comes from fog toward the page ground, not from shadows, so the
          mesh recedes into the page rather than sitting on top of it. */}
      <fog attach="fog" args={[palette.bg.getHex(), distance - 4.5, distance + 5.5]} />
      <primitive object={edges} />
      <primitive object={nodes} />
      <primitive object={packets} />
    </>
  );
}
