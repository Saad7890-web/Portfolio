'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLens } from '@/components/lens/LensProvider';
import { ease } from '@/lib/motion';
import { useIdleAfterPaint, useInView, useMotionTier, usePageVisible } from '@/lib/perf';
import { MeshFallback } from './MeshFallback';
import { ANCHORS, SCENES } from './scene';
import type { PointerField } from './types';

/**
 * Nothing here imports three. The WebGL module is a separate chunk behind
 * `dynamic`, requested only once the device has passed the capability check
 * *and* the main thread has gone idle after first paint — so LCP is the SVG
 * mesh below, never a shader compile.
 */
const EventMesh = dynamic(() => import('./EventMesh'), { ssr: false, loading: () => null });

export function HeroVisual() {
  const { lens } = useLens();
  const scene = SCENES[lens];

  const frame = useRef<HTMLDivElement>(null);
  const tier = useMotionTier();
  const inView = useInView(frame);
  const pageVisible = usePageVisible();
  const idle = useIdleAfterPaint(tier === 'full');

  /** True once the canvas has actually painted a frame — not just mounted. */
  const [painted, setPainted] = useState(false);
  const [fallbackRetired, setFallbackRetired] = useState(false);

  const pointer = useRef<PointerField>({ x: 0, y: 0, strength: 0 });
  const labels = useRef<(HTMLElement | null)[]>([]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.current.strength = 1;
  }, []);

  const onPointerLeave = useCallback(() => {
    // The field eases out inside the render loop; this only drops the target.
    pointer.current.strength = 0;
  }, []);

  const onReady = useCallback(() => setPainted(true), []);

  return (
    /*
     * A figure, not a labelled `role="img"`. The caption below is already the
     * text alternative — it is the same sentence the label would carry, except
     * everyone can read it. Wrapping the whole thing in `role="img"` made all
     * of its descendants presentational, which meant that sentence existed on
     * the page twice and was reachable neither time.
     */
    <figure data-print-hide className="flex flex-col gap-4">
      <div
        ref={frame}
        // The rendering itself: nothing in here is focusable, and nothing in
        // here says anything the caption does not.
        aria-hidden
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative h-[300px] w-full sm:h-[400px] lg:h-[500px]"
      >
        {!fallbackRetired && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: painted ? 0 : 1 }}
            transition={ease(0.5)}
            onAnimationComplete={() => painted && setFallbackRetired(true)}
          >
            <MeshFallback
              lens={lens}
              animated={tier !== 'static'}
              running={inView && pageVisible}
            />
          </motion.div>
        )}

        {tier === 'full' && idle && (
          <EventMesh
            lens={lens}
            active={inView && pageVisible}
            pointer={pointer}
            labels={labels}
            onReady={onReady}
          />
        )}

        {/* Anchor labels live in the DOM, positioned per frame by the render
            loop: crisp at any DPR, themed by CSS, and no font pipeline in the
            3D bundle. Hidden until the canvas is driving them. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {ANCHORS.map((node, i) => (
            <span
              key={node}
              ref={(el) => {
                labels.current[i] = el;
              }}
              style={{ opacity: 0 }}
              className={`absolute top-0 left-0 will-change-transform ${painted ? '' : 'hidden'}`}
            >
              <span className="text-faint flex -translate-y-1/2 items-center gap-1.5 text-[0.6rem] tracking-[0.14em] whitespace-nowrap uppercase">
                <span className="bg-accent/50 h-px w-3" />
                <span data-numeral>{scene.labels[i]}</span>
              </span>
            </span>
          ))}
        </div>
      </div>

      <figcaption className="min-h-[2.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={lens}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease(0.24)}
            className="text-faint max-w-[46ch] text-[0.72rem] leading-relaxed"
            data-numeral
          >
            {scene.caption}
          </motion.p>
        </AnimatePresence>
      </figcaption>
    </figure>
  );
}
