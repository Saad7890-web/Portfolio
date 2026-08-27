import { signals } from '@/content';
import { Band } from './Band';

/** Lens-independent: stays a server component, ships no JS. */
export function Signals() {
  return (
    <Band label="Signals" id="signals">
      <dl className="grid gap-6 sm:grid-cols-2">
        {signals.map((s) => (
          <div key={s.id}>
            <dt className="font-medium">
              {s.href ? (
                <a href={s.href} className="hover:text-accent transition-colors">
                  {s.label} ↗
                </a>
              ) : (
                s.label
              )}
            </dt>
            <dd className="text-muted mt-1.5 text-[0.85rem] leading-relaxed">{s.detail}</dd>
          </div>
        ))}
      </dl>
    </Band>
  );
}
