import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { rankBy, topBy, chipsFor, emphasis } from '@/lib/rank';
import { asset } from '@/lib/site';
import {
  cvForPillar,
  experience,
  headline,
  metrics,
  pillarDetails,
  PILLAR_LABEL,
  PILLAR_SHORT,
  PILLARS,
  profile,
  projects,
  signals,
  stack,
  summary,
  type Pillar,
} from '@/content';

/**
 * P1: everything below is derived from content/ — no section holds a hardcoded
 * fact. The lens is fixed here; P2 makes it interactive and animates the
 * re-ranking these same helpers already produce.
 */
const LENS: Pillar = 'fullstack';

export default function Home() {
  const lead = headline[LENS];

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="shell py-20 sm:py-28">
          <LensPreview active={LENS} />

          <h1 className="mt-10 max-w-[20ch] text-4xl leading-[1.02] font-medium tracking-[-0.03em] text-balance sm:text-6xl">
            {lead.lead}
          </h1>
          <p className="text-muted mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty">
            {lead.sub}
          </p>
          <p className="text-faint mt-4 max-w-[58ch] text-sm leading-relaxed text-pretty">
            {summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={asset(cvForPillar[LENS].file)}
              className="bg-accent text-accent-ink rounded-full px-5 py-2.5 text-[0.85rem] font-medium"
            >
              {cvForPillar[LENS].label} ↓
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="hairline hover:border-hairline-strong rounded-full px-5 py-2.5 text-[0.85rem] transition-colors"
            >
              {profile.email}
            </a>
          </div>
        </section>

        {/* ── Proof bar ────────────────────────────────────────── */}
        <Band label="Proof" id="proof">
          <dl className="border-hairline grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border bg-[var(--hairline)] md:grid-cols-4">
            {topBy(metrics, LENS, 8).map((m) => (
              <div key={m.id} className="bg-surface p-5">
                <dt className="text-3xl tracking-tight" data-numeral>
                  {m.value}
                </dt>
                <dd className="mt-2">
                  <span className="block text-[0.8rem]">{m.label}</span>
                  <span className="text-faint mt-1 block text-[0.72rem] leading-snug">
                    {m.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Band>

        {/* ── Pillars ──────────────────────────────────────────── */}
        <Band label="What I do" id="pillars">
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)] lg:grid-cols-2">
            {pillarDetails.map((p) => (
              <article key={p.id} className="bg-surface p-6">
                <h3 className="flex items-center gap-2 text-[0.75rem] tracking-[0.16em] uppercase">
                  <span
                    className={p.id === LENS ? 'bg-accent size-1.5 rounded-full' : 'hidden'}
                    aria-hidden
                  />
                  {PILLAR_LABEL[p.id]}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-pretty">{p.claim}</p>
                <ul className="text-muted mt-4 space-y-2 text-[0.82rem] leading-relaxed">
                  {p.evidence.map((e) => (
                    <li key={e} className="border-hairline border-l pl-3">
                      {e}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Band>

        {/* ── Work ─────────────────────────────────────────────── */}
        <Band label="Selected work" id="work">
          <div className="space-y-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)]">
            {rankBy(
              projects.filter((p) => p.tier === 1),
              LENS,
            ).map((p) => (
              <article key={p.id} className="bg-surface p-6">
                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-xl font-medium tracking-tight">{p.name}</h3>
                  <span className="text-muted text-[0.85rem]">{p.tagline}</span>
                  {p.href && (
                    <a href={p.href} className="text-accent ml-auto text-[0.75rem]" data-numeral>
                      {p.hrefLabel} ↗
                    </a>
                  )}
                </header>

                <p className="text-muted mt-3 max-w-[70ch] text-[0.92rem] leading-relaxed text-pretty">
                  {p.summary}
                </p>

                <ul className="text-muted mt-4 space-y-2 text-[0.82rem] leading-relaxed">
                  {p.bullets.map((b) => (
                    <li key={b} className="border-hairline border-l pl-3">
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {chipsFor(p.weight).map((c) => (
                    <span
                      key={c}
                      className="bg-accent-soft text-accent rounded-full px-2.5 py-1 text-[0.68rem] tracking-wide"
                    >
                      {PILLAR_SHORT[c]}
                    </span>
                  ))}
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-faint hairline rounded-full px-2.5 py-1 text-[0.68rem]"
                      data-numeral
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-px grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
            {rankBy(
              projects.filter((p) => p.tier === 2),
              LENS,
            ).map((p) => (
              <article key={p.id} className="bg-surface p-5">
                <h3 className="text-[0.95rem] font-medium">{p.name}</h3>
                <p className="text-faint mt-1 text-[0.72rem]">{p.tagline}</p>
                <p className="text-muted mt-3 text-[0.8rem] leading-relaxed">{p.summary}</p>
              </article>
            ))}
          </div>
        </Band>

        {/* ── Experience ───────────────────────────────────────── */}
        <Band label="Experience" id="experience">
          <ol className="space-y-8">
            {experience.map((r) => (
              <li key={r.id} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <div>
                  <p className="text-faint text-[0.75rem]" data-numeral>
                    {r.start} — {r.end === 'present' ? 'present' : r.end}
                  </p>
                </div>
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

        {/* ── Stack ────────────────────────────────────────────── */}
        <Band label="Stack" id="stack">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rankBy(stack, LENS).map((g) => (
              <section key={g.id} style={{ opacity: emphasis(g.weight, LENS) }}>
                <h3 className="text-[0.72rem] tracking-[0.16em] uppercase">{g.label}</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <li
                      key={i}
                      className="text-muted hairline rounded-full px-2.5 py-1 text-[0.72rem]"
                      data-numeral
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Band>

        {/* ── Signals ──────────────────────────────────────────── */}
        <Band label="Signals" id="signals">
          <dl className="grid gap-6 sm:grid-cols-2">
            {signals.map((s) => (
              <div key={s.id}>
                <dt className="font-medium">{s.label}</dt>
                <dd className="text-muted mt-1.5 text-[0.85rem] leading-relaxed">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </Band>
      </main>

      <SiteFooter />
    </>
  );
}

function Band({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-label={label} className="border-hairline shell border-t py-14">
      <h2 className="text-faint mb-6 text-[0.72rem] tracking-[0.18em] uppercase">{label}</h2>
      {children}
    </section>
  );
}

/** Static stand-in for the P2 lens switch — shows the four pillars as peers. */
function LensPreview({ active }: { active: Pillar }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="list" aria-label="Role lens preview">
      {PILLARS.map((p) => (
        <span
          key={p}
          role="listitem"
          aria-current={p === active ? 'true' : undefined}
          className={
            p === active
              ? 'bg-accent text-accent-ink rounded-full px-3.5 py-1.5 text-[0.76rem] font-medium'
              : 'text-muted hairline rounded-full px-3.5 py-1.5 text-[0.76rem]'
          }
        >
          {PILLAR_LABEL[p]}
        </span>
      ))}
    </div>
  );
}
