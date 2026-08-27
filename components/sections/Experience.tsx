import { experience } from '@/content';
import { Band } from './Band';

/** Lens-independent: stays a server component, ships no JS. */
export function Experience() {
  return (
    <Band label="Experience" id="experience">
      <ol className="space-y-8">
        {experience.map((r) => (
          <li key={r.id} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <p className="text-faint text-[0.75rem]" data-numeral>
              {r.start} — {r.end === 'present' ? 'present' : r.end}
            </p>
            <div>
              <h3 className="font-medium">
                {r.title} · <span className="text-muted">{r.company}</span>
              </h3>
              <ul className="text-muted mt-3 space-y-2 text-[0.82rem] leading-relaxed">
                {r.bullets.map((b) => (
                  <li key={b} className="border-hairline border-l pl-3">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Band>
  );
}
