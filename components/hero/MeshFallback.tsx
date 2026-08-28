'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Pillar } from '@/content/types';
import { FLAT_VIEWBOX, SCENES, flatten } from './scene';
import { ease } from '@/lib/motion';

/**
 * The mesh without WebGL. This is not a degraded placeholder — it is the whole
 * visual for every device on the light path, it is the LCP paint for devices
 * that do get WebGL, and with `animated={false}` it is the reduced-motion
 * rendering. Inline SVG, no images, no extra bytes over the HTML itself.
 */
export function MeshFallback({ lens, animated }: { lens: Pillar; animated: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.svg
        key={lens}
        viewBox={`0 0 ${FLAT_VIEWBOX} ${FLAT_VIEWBOX}`}
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={animated ? { opacity: 0 } : undefined}
        transition={ease(0.3)}
        className="size-full"
        aria-hidden
      >
        <Graph lens={lens} animated={animated} />
      </motion.svg>
    </AnimatePresence>
  );
}

function Graph({ lens, animated }: { lens: Pillar; animated: boolean }) {
  const flat = useMemo(() => flatten(lens), [lens]);
  const labels = SCENES[lens].labels;

  return (
    <>
      <g stroke="currentColor" strokeWidth={0.28} className="text-text opacity-[0.22]">
        {flat.edges.map((e, i) => {
          const a = flat.points[e.a]!;
          const b = flat.points[e.b]!;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
      </g>

      <g className="text-text">
        {flat.points.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.hot ? 1.5 : 1}
            fill={p.hot ? 'var(--accent)' : 'currentColor'}
            opacity={p.hot ? 0.95 : 0.4}
          />
        ))}
      </g>

      {/* Packets. Two circles rather than a blur filter: same read, no offscreen pass. */}
      <g fill="var(--accent)">
        {flat.packets.map((edgeIndex, i) => {
          const edge = flat.edges[edgeIndex];
          if (!edge) return null;
          const a = flat.points[edge.a]!;
          const b = flat.points[edge.b]!;
          const path = `M${a.x} ${a.y} L${b.x} ${b.y}`;
          // Negative begin offsets desynchronise the packets without a lead-in.
          const begin = `-${(i * 0.62).toFixed(2)}s`;

          return (
            <g
              key={`${edgeIndex}-${i}`}
              transform={animated ? undefined : `translate(${a.x} ${a.y})`}
            >
              <circle r={2.6} opacity={0.18} />
              <circle r={0.85} />
              {animated && (
                <animateMotion dur="2.7s" begin={begin} repeatCount="indefinite" path={path} />
              )}
            </g>
          );
        })}
      </g>

      <g
        className="fill-faint"
        fontSize={2.6}
        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
      >
        {flat.points
          .filter((p) => p.anchor >= 0)
          .map((p) => {
            // Flip the label inboard near the right edge, or it clips the viewBox.
            const flip = p.x > FLAT_VIEWBOX * 0.62;
            return (
              <text
                key={p.id}
                x={flip ? p.x - 3 : p.x + 3}
                y={p.y + 1}
                textAnchor={flip ? 'end' : 'start'}
                letterSpacing={0.12}
              >
                {labels[p.anchor as 0 | 1 | 2 | 3]}
              </text>
            );
          })}
      </g>
    </>
  );
}
