import type { StageId } from '@/content/types';

/**
 * Pure layout for the deep-dive diagram: where the four boxes sit and which
 * way each link runs. No copy lives here — the labels come from
 * content/deepdive.ts, so the drawing and the claims stay separately editable.
 *
 * Coordinates are hand-placed in a 400×200 viewBox. Every link is a straight
 * line between two points on facing box edges, with the outbound and return
 * lanes offset a few units apart so a round trip reads as two arrows, not one.
 */
export const VIEWBOX = { w: 400, h: 200 } as const;

export type NodeId = 'agent' | 'proxy' | 'provider' | 'tape';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const NODES: Record<NodeId, Box> = {
  agent: { x: 6, y: 58, w: 88, h: 50 },
  proxy: { x: 156, y: 58, w: 88, h: 50 },
  provider: { x: 306, y: 8, w: 88, h: 50 },
  tape: { x: 306, y: 108, w: 88, h: 50 },
};

export type HopId =
  'agent-proxy' | 'proxy-agent' | 'proxy-provider' | 'provider-proxy' | 'proxy-tape' | 'tape-proxy';

interface Point {
  x: number;
  y: number;
}

export interface Hop {
  id: HopId;
  from: NodeId;
  to: NodeId;
  a: Point;
  b: Point;
}

const hop = (id: HopId, from: NodeId, to: NodeId, a: Point, b: Point): Hop => ({
  id,
  from,
  to,
  a,
  b,
});

export const HOPS: Record<HopId, Hop> = {
  'agent-proxy': hop('agent-proxy', 'agent', 'proxy', { x: 94, y: 77 }, { x: 156, y: 77 }),
  'proxy-agent': hop('proxy-agent', 'proxy', 'agent', { x: 156, y: 89 }, { x: 94, y: 89 }),
  'proxy-provider': hop(
    'proxy-provider',
    'proxy',
    'provider',
    { x: 244, y: 72 },
    { x: 306, y: 29 },
  ),
  'provider-proxy': hop(
    'provider-proxy',
    'provider',
    'proxy',
    { x: 306, y: 39 },
    { x: 244, y: 80 },
  ),
  'proxy-tape': hop('proxy-tape', 'proxy', 'tape', { x: 244, y: 94 }, { x: 306, y: 129 }),
  'tape-proxy': hop('tape-proxy', 'tape', 'proxy', { x: 306, y: 139 }, { x: 244, y: 102 }),
};

/**
 * live — the call leaves the building and costs money
 * tape — the call is answered from disk
 * warn — the fingerprint did not match
 */
export type Tone = 'live' | 'tape' | 'warn';

export interface Leg {
  hop: HopId;
  tone: Tone;
}

const leg = (id: HopId, tone: Tone): Leg => ({ hop: id, tone });

/**
 * The route traffic takes in each state, in order. The diagram derives which
 * boxes are lit from this, so a state can never claim a node it never touches:
 * in replay and divergence the provider is simply not on the route.
 */
export const ROUTES: Record<StageId, Leg[]> = {
  record: [
    leg('agent-proxy', 'live'),
    leg('proxy-provider', 'live'),
    leg('provider-proxy', 'live'),
    leg('proxy-tape', 'tape'),
    leg('proxy-agent', 'live'),
  ],
  replay: [
    leg('agent-proxy', 'live'),
    leg('proxy-tape', 'tape'),
    leg('tape-proxy', 'tape'),
    leg('proxy-agent', 'live'),
  ],
  divergence: [leg('agent-proxy', 'live'), leg('proxy-tape', 'tape'), leg('tape-proxy', 'warn')],
  fork: [
    leg('agent-proxy', 'live'),
    leg('proxy-tape', 'tape'),
    leg('tape-proxy', 'tape'),
    leg('proxy-provider', 'live'),
    leg('provider-proxy', 'live'),
    leg('proxy-agent', 'live'),
  ],
};

/** The step strip along the bottom. Chip width is derived from the step count. */
export const STRIP = { y: 172, h: 22, gap: 5, inset: 6, caption: 165 } as const;

export const stripSlot = (index: number, count: number) => {
  const width = (VIEWBOX.w - STRIP.inset * 2 - STRIP.gap * (count - 1)) / count;
  return { x: STRIP.inset + index * (width + STRIP.gap), w: width };
};
