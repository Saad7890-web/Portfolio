import type { Pillar } from '@/content/types';

/**
 * The hero mesh is one graph — fixed nodes, fixed edges — that four lenses
 * re-read. Nothing is added or removed when the lens changes; the nodes travel
 * to a new layout and the packets change which edges they prefer. That is the
 * whole argument of the site rendered as geometry: same engineer, four honest
 * framings of the same system.
 */

export const NODE_COUNT = 40;
export const PACKET_COUNT = 54;

export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];

/** Deterministic jitter — the mesh must look identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Node 0 is the hub: the inference node under the AI lens. */
export const HUB = 0;

/** Edges from the hub exist in every lens; only the AI layout makes them read. */
const SPOKES = [3, 8, 12, 17, 21, 26, 31, 36] as const;

/** Nodes that carry a DOM label. Index 0 is the hub, so it gets the centre. */
export const ANCHORS = [HUB, 9, 22, 34] as const;

// ---------------------------------------------------------------------------
// Layouts — one per lens. Same 40 nodes, four arrangements.
// ---------------------------------------------------------------------------

/** Backend: a loose cloud. Dense local connections, no centre, no hierarchy. */
function cloudLayout(): Vec3[] {
  const rand = mulberry32(0x5eed01);
  const out: Vec3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    const r = 3.15 * (0.82 + rand() * 0.34);
    out.push([Math.cos(theta) * ring * r, y * r * 0.8, Math.sin(theta) * ring * r]);
  }
  return out;
}

/** Platform: 5 columns of 8 replicas. A fleet, not a cloud. */
function replicaLayout(): Vec3[] {
  const rand = mulberry32(0x5eed02);
  const cols = 5;
  const rows = NODE_COUNT / cols;
  const out: Vec3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push([
      (col - (cols - 1) / 2) * 1.5,
      (row - (rows - 1) / 2) * 0.82,
      ((col % 2) - 0.5) * 1.1 + (rand() - 0.5) * 0.3,
    ]);
  }
  return out;
}

/**
 * AI: a hub at the origin, its spokes pulled close, everything else swept out
 * onto a surrounding annulus. Deliberately *not* another sphere — sharing the
 * cloud's fibonacci distribution left the two layouts near-identical, and a
 * lens change that does not move anything is not a lens change.
 */
function inferenceLayout(): Vec3[] {
  const rand = mulberry32(0x5eed03);
  const spokeSet = new Set<number>(SPOKES);
  const outerCount = NODE_COUNT - 1 - SPOKES.length;
  const out: Vec3[] = [];
  let spokeSeen = 0;
  let outerSeen = 0;

  for (let i = 0; i < NODE_COUNT; i++) {
    if (i === HUB) {
      out.push([0, 0, 0]);
      continue;
    }
    if (spokeSet.has(i)) {
      const a = (spokeSeen / SPOKES.length) * Math.PI * 2;
      spokeSeen++;
      out.push([Math.cos(a) * 1.5, Math.sin(a) * 1.35, (rand() - 0.5) * 0.5]);
      continue;
    }
    const a = (outerSeen / outerCount) * Math.PI * 2 + 0.35;
    outerSeen++;
    const r = 3.75 + (rand() - 0.5) * 0.55;
    out.push([Math.cos(a) * r, Math.sin(a) * r * 0.82, (rand() - 0.5) * 1.5]);
  }
  return out;
}

/** Full-stack: the mesh splits. Even indices are the client tier, odd the services. */
function tierLayout(): Vec3[] {
  const rand = mulberry32(0x5eed04);
  const perTier = NODE_COUNT / 2;
  const cols = 5;
  const out: Vec3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const upper = i % 2 === 0;
    const slot = Math.floor(i / 2);
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const rowsPerTier = perTier / cols;
    out.push([
      (col - (cols - 1) / 2) * 1.5 + (rand() - 0.5) * 0.25,
      (upper ? 1.5 : -1.5) + (row - (rowsPerTier - 1) / 2) * 0.5,
      (row - (rowsPerTier - 1) / 2) * 1.15,
    ]);
  }
  return out;
}

const BASE = cloudLayout();

export const LAYOUTS: Record<Pillar, Vec3[]> = {
  backend: BASE,
  platform: replicaLayout(),
  ai: inferenceLayout(),
  fullstack: tierLayout(),
};

// ---------------------------------------------------------------------------
// Topology — built once, from the cloud layout, and never rebuilt.
// ---------------------------------------------------------------------------

function buildEdges(points: Vec3[], k: number): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];

  const add = (a: number, b: number) => {
    const [lo, hi] = a < b ? [a, b] : [b, a];
    const key = `${lo}:${hi}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push([lo, hi]);
  };

  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    const near = points
      .map((q, j) => ({ j, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    for (const { j } of near) add(i, j);
  }

  // The hub's spokes are part of the permanent topology. Under three lenses
  // they read as ordinary long edges; under AI they become the fan-in.
  for (const s of SPOKES) add(HUB, s);

  return edges;
}

export const EDGES: Edge[] = buildEdges(BASE, 3);

// ---------------------------------------------------------------------------
// Per-lens reading of that topology
// ---------------------------------------------------------------------------

/** How packets move. Same particles, four behaviours. */
export type PacketMode = 'steady' | 'wave' | 'inference' | 'crossing';

const spokeEdges = EDGES.map((e, i) => [e, i] as const)
  .filter(([e]) => e[0] === HUB || e[1] === HUB)
  .map(([, i]) => i);

/** Edges that join the two tiers of the full-stack layout: a request crossing. */
const crossingEdges = EDGES.map((e, i) => [e, i] as const)
  .filter(([e]) => e[0]! % 2 !== e[1]! % 2)
  .map(([, i]) => i);

const allEdges = EDGES.map((_, i) => i);

/** Which edges a packet respawns onto. Weighted by repetition, not by a table. */
export const EDGE_POOL: Record<Pillar, number[]> = {
  backend: allEdges,
  platform: allEdges,
  // Three parts hub traffic to one part background chatter.
  ai: [...spokeEdges, ...spokeEdges, ...spokeEdges, ...allEdges],
  fullstack: [...crossingEdges, ...crossingEdges, ...allEdges],
};

/** Nodes rendered in the accent rather than the neutral. Never more than a few. */
export const HOT_NODES: Record<Pillar, ReadonlySet<number>> = {
  backend: new Set(ANCHORS),
  platform: new Set([...ANCHORS, 2, 7, 12, 17, 22, 27, 32, 37]),
  ai: new Set([HUB, ...SPOKES]),
  fullstack: new Set([...ANCHORS, ...crossingEdges.flatMap((i) => [...EDGES[i]!])].slice(0, 14)),
};

export interface LensScene {
  /** Labels for ANCHORS, in the same order. */
  labels: readonly [string, string, string, string];
  /** Sits under the canvas. Also the accessible name of the whole visual. */
  caption: string;
  packets: PacketMode;
}

export const SCENES: Record<Pillar, LensScene> = {
  backend: {
    labels: ['Postgres', 'Outbox', 'Broker', 'Read model'],
    caption: 'Write, then publish — outbox to broker to read model, at-least-once, per tenant.',
    packets: 'steady',
  },
  platform: {
    labels: ['Build', 'Registry', 'Replica', 'Canary'],
    caption: 'A deploy wave rolling through the fleet — build, registry, replicas, zero downtime.',
    packets: 'wave',
  },
  ai: {
    labels: ['Inference', 'Agent', 'Proxy', 'Tape'],
    caption:
      'Agent to proxy to inference and back — tokens on the wire, a tape written beside them.',
    packets: 'inference',
  },
  fullstack: {
    labels: ['Client', 'API', 'Worker', 'Data'],
    caption: 'A client tier and a service tier, and every request that has to cross between them.',
    packets: 'crossing',
  },
};

// ---------------------------------------------------------------------------
// The 2D projection the SVG fallback draws
// ---------------------------------------------------------------------------

/** A readable subset — 18 nodes carry the idea without 40 dots of noise. */
const FLAT_NODES = [0, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 22, 26, 30, 34, 37] as const;

export const FLAT_VIEWBOX = 100;

export interface FlatScene {
  points: { id: number; x: number; y: number; hot: boolean; anchor: number }[];
  edges: { a: number; b: number }[];
  /** Edge indices (into `edges`) that carry a visible packet. */
  packets: number[];
}

/** Orthographic-ish projection of a lens layout, normalised into the viewBox. */
export function flatten(lens: Pillar): FlatScene {
  const layout = LAYOUTS[lens]!;
  const hot = HOT_NODES[lens]!;

  const raw = FLAT_NODES.map((id) => {
    const [x, y, z] = layout[id]!;
    // Fold a little depth into x so the cloud layout does not self-overlap.
    return { id, x: x + z * 0.26, y: -y };
  });

  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 9;
  const span = FLAT_VIEWBOX - pad * 2;

  const points = raw.map((p) => ({
    id: p.id,
    x: round(pad + ((p.x - minX) / (maxX - minX || 1)) * span),
    y: round(pad + ((p.y - minY) / (maxY - minY || 1)) * span),
    hot: hot.has(p.id),
    anchor: ANCHORS.indexOf(p.id as (typeof ANCHORS)[number]),
  }));

  // Re-derive nearest neighbours in 2D: projecting the 3D edge list leaves
  // crossings that read as noise once the depth cue is gone.
  const seen = new Set<string>();
  const edges: { a: number; b: number }[] = [];
  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const [lo, hi] = i < j ? [i, j] : [j, i];
        const key = `${lo}:${hi}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ a: lo!, b: hi! });
      });
  });

  // Six packets, spread across the edge list rather than clustered at its head.
  const step = Math.max(1, Math.floor(edges.length / 6));
  const packets = Array.from({ length: 6 }, (_, i) => (i * step) % edges.length);

  return { points, edges, packets };
}

const round = (n: number) => Math.round(n * 100) / 100;
