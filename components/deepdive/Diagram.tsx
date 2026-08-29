'use client';

import { AnimatePresence, motion } from 'motion/react';
import { deepDive, deepDiveNodes } from '@/content';
import type { DeepDiveStage, StepState } from '@/content/types';
import { DUR, EASE, ease } from '@/lib/motion';
import {
  HOPS,
  NODES,
  ROUTES,
  STRIP,
  VIEWBOX,
  stripSlot,
  type Hop,
  type Leg,
  type NodeId,
} from './topology';

const MONO = { fontFamily: 'var(--font-mono), ui-monospace, monospace' } as const;

/** Distance between packets along a link. One cycle moves a packet one gap. */
const PACKET_GAP = 16;
const PACKET_CYCLE = 0.5;

const line = (h: Hop) => `M${h.a.x} ${h.a.y} L${h.b.x} ${h.b.y}`;

const STEP_STYLE: Record<StepState, { fill: string; stroke: string; ink: string; dash?: string }> =
  {
    taped: { fill: 'var(--accent-soft)', stroke: 'var(--accent)', ink: 'var(--accent)' },
    replayed: {
      fill: 'transparent',
      stroke: 'var(--accent)',
      ink: 'var(--accent)',
      dash: '3 2.5',
    },
    flagged: { fill: 'var(--warn-soft)', stroke: 'var(--warn)', ink: 'var(--warn)' },
    skipped: { fill: 'transparent', stroke: 'var(--hairline-strong)', ink: 'var(--faint)' },
    edited: { fill: 'var(--accent)', stroke: 'var(--accent)', ink: 'var(--accent-ink)' },
    live: { fill: 'transparent', stroke: 'var(--accent)', ink: 'var(--accent)' },
  };

/**
 * Hand-authored SVG, no library, no image. The whole diagram is four boxes and
 * six links; what changes between states is which links carry packets, which
 * way, and what the step strip along the bottom says happened to each step.
 *
 * `animated` is false for reduced motion and while the section is off screen —
 * every state still renders its full route and strip, just without the loop.
 */
export function Diagram({ stage, animated }: { stage: DeepDiveStage; animated: boolean }) {
  const route = ROUTES[stage.id];
  const t = animated ? ease(DUR.base) : { duration: 0 };

  // A box is lit because traffic reaches it, never because a table says so.
  const lit = new Set<NodeId>();
  route.forEach(({ hop }) => {
    lit.add(HOPS[hop].from);
    lit.add(HOPS[hop].to);
  });

  const diverged = route.find((l) => l.tone === 'warn');

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      role="img"
      aria-label={`${stage.label}. ${stage.claim} ${stage.legend}`}
      className="w-full"
    >
      {/* The full topology, always visible: a state hides nothing, it lights a path. */}
      <g stroke="var(--hairline-strong)" strokeWidth={0.6}>
        {Object.values(HOPS).map((h) => (
          <path key={h.id} d={line(h)} fill="none" />
        ))}
      </g>

      <AnimatePresence mode="wait" initial={false}>
        <motion.g
          key={stage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={animated ? ease(DUR.fast) : { duration: 0 }}
        >
          {route.map((leg, i) => (
            <Flow key={leg.hop} leg={leg} order={i} animated={animated} />
          ))}

          {diverged && <Mismatch hop={HOPS[diverged.hop]} animated={animated} />}

          <text
            x={STRIP.inset}
            y={STRIP.caption}
            fontSize={5}
            letterSpacing={0.9}
            className="fill-faint"
            style={MONO}
          >
            {deepDive.stripLabel}
          </text>

          {stage.steps.map((state, i) => (
            <Step key={i} index={i} count={stage.steps.length} state={state} />
          ))}
        </motion.g>
      </AnimatePresence>

      {(Object.keys(NODES) as NodeId[]).map((id) => (
        <Node key={id} id={id} lit={lit.has(id)} transition={t} />
      ))}
    </svg>
  );
}

/**
 * One leg of the route: a rail in the tone of the traffic, plus packets moving
 * along it. Dashed rail means the answer came off disk instead of the wire.
 */
function Flow({ leg, order, animated }: { leg: Leg; order: number; animated: boolean }) {
  const hop = HOPS[leg.hop];
  const d = line(hop);
  const color = leg.tone === 'warn' ? 'var(--warn)' : 'var(--accent)';
  // Staggered so the route lights up hop by hop, in the order traffic takes it.
  const delay = animated ? order * 0.1 : 0;

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={0.9}
        strokeDasharray={leg.tone === 'tape' ? '3 3' : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={animated ? { ...ease(DUR.base), delay } : { duration: 0 }}
      />

      {/* A divergence is where traffic stops, so nothing marches down this leg. */}
      {leg.tone !== 'warn' && (
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray={`0.01 ${PACKET_GAP}`}
          initial={{ strokeDashoffset: PACKET_GAP }}
          // Linear, and the only place on the site that is: a conveyor with an
          // eased loop visibly stutters every time it reaches the seam.
          animate={animated ? { strokeDashoffset: 0 } : { strokeDashoffset: PACKET_GAP / 2 }}
          transition={
            animated
              ? { duration: PACKET_CYCLE, ease: 'linear', repeat: Infinity, delay }
              : { duration: 0 }
          }
        />
      )}
    </g>
  );
}

/** The fingerprint that did not match, marked where the proxy notices it. */
function Mismatch({ hop, animated }: { hop: Hop; animated: boolean }) {
  const x = (hop.a.x + hop.b.x) / 2;
  const y = (hop.a.y + hop.b.y) / 2;

  return (
    <g>
      {animated && (
        <motion.circle
          cx={x}
          cy={y}
          fill="none"
          stroke="var(--warn)"
          strokeWidth={0.7}
          initial={{ r: 6, opacity: 0.55 }}
          animate={{ r: 12, opacity: 0 }}
          transition={{ duration: 1.6, ease: EASE, repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
      <circle cx={x} cy={y} r={6.4} fill="var(--bg)" />
      <circle
        cx={x}
        cy={y}
        r={6.4}
        fill="var(--warn-soft)"
        stroke="var(--warn)"
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={y + 2.6}
        textAnchor="middle"
        fontSize={7.5}
        fill="var(--warn)"
        style={MONO}
        aria-hidden
      >
        ≠
      </text>
    </g>
  );
}

function Node({
  id,
  lit,
  transition,
}: {
  id: NodeId;
  lit: boolean;
  transition: ReturnType<typeof ease> | { duration: number };
}) {
  const box = NODES[id];
  const copy = deepDiveNodes[id];
  const cx = box.x + box.w / 2;

  return (
    <motion.g animate={{ opacity: lit ? 1 : 0.32 }} transition={transition}>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={7}
        fill="var(--surface-2)"
        stroke="var(--hairline-strong)"
        strokeWidth={0.7}
      />
      {/* A second outline rather than an animated stroke colour: CSS variables
          do not interpolate, and opacity does. */}
      <motion.rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={7}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={0.9}
        animate={{ opacity: lit ? 0.6 : 0 }}
        transition={transition}
      />
      <text
        x={cx}
        y={box.y + 22}
        textAnchor="middle"
        fontSize={9.5}
        letterSpacing={0.3}
        className="fill-text"
        style={MONO}
      >
        {copy.label}
      </text>
      <text
        x={cx}
        y={box.y + 34}
        textAnchor="middle"
        fontSize={5.4}
        className="fill-faint"
        style={MONO}
      >
        {copy.sub}
      </text>
    </motion.g>
  );
}

/** One step of the run. Six of these are the difference between the states. */
function Step({ index, count, state }: { index: number; count: number; state: StepState }) {
  const { x, w } = stripSlot(index, count);
  const style = STEP_STYLE[state];

  return (
    <g>
      <rect
        x={x}
        y={STRIP.y}
        width={w}
        height={STRIP.h}
        rx={4}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={0.8}
        strokeDasharray={style.dash}
      />
      <text
        x={x + w / 2}
        y={STRIP.y + STRIP.h / 2 + 2.8}
        textAnchor="middle"
        fontSize={7.5}
        fill={style.ink}
        style={MONO}
      >
        {index + 1}
      </text>
    </g>
  );
}
