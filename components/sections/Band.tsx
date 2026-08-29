import { Reveal } from '@/components/primitives/Reveal';

/**
 * Every section on the page is one of these, which is what makes the motion
 * pass a one-file change: the label pins and the body reveals, everywhere,
 * without a section having to opt in.
 *
 * The label sticks just under the header for exactly as long as its own section
 * is on screen — `position: sticky` is bounded by the parent — so scrolling the
 * page reads as one label handing over to the next.
 */
export function Band({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-label={label} className="border-hairline shell border-t py-14">
      <h2 className="text-faint bg-bg sticky top-16 z-30 mb-6 py-2 text-[0.72rem] tracking-[0.18em] uppercase">
        {label}
      </h2>
      <Reveal>{children}</Reveal>
    </section>
  );
}
