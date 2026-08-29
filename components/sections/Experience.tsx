import { experience } from '@/content';
import { Band } from './Band';

/**
 * Lens-independent, and still a server component: the pinned date column and
 * the rail that draws itself as each role scrolls past are both pure CSS, so
 * the scroll-driven timeline costs this section zero bytes of JavaScript.
 */
export function Experience() {
  return (
    <Band label="Experience" id="experience">
      <ol className="space-y-10">
        {experience.map((r) => (
          <li key={r.id} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            {/* Holds under the section label while its own bullets scroll by,
                so the dates stay attached to what you are currently reading. */}
            <p className="text-faint text-[0.75rem] sm:sticky sm:top-28 sm:self-start" data-numeral>
              {r.start} — {r.end === 'present' ? 'present' : r.end}
            </p>

            <div className="relative pl-5">
              {/* Track, then the accent drawn over it by the view() timeline. */}
              <span aria-hidden className="bg-hairline absolute top-1 bottom-1 left-0 w-px" />
              <span aria-hidden className="rail bg-accent absolute top-1 bottom-1 left-0 w-px" />

              <h3 className="font-medium">
                {r.title} · <span className="text-muted">{r.company}</span>
              </h3>
              <ul className="text-muted mt-3 space-y-2 text-[0.82rem] leading-relaxed">
                {r.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Band>
  );
}
