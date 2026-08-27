# Portfolio — Implementation Plan

**Owner:** Saad Islam Omy · **Repo:** github.com/Saad7890-web/Portfolio · **Target:** static site, deployable to Vercel _or_ GitHub Pages

---

## 1. The core problem, and the idea that solves it

You have six CVs. Each one is the same person tilted toward a different buyer:

| CV file                                  | Tilt                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `...CV-Backend-Python.pdf`               | Django/DRF, Postgres, Celery at scale          |
| `...CV-Fullstack.pdf`                    | React/Next + TS & Python backends              |
| `...Resume-Go-Fullstack.pdf`             | Go, distributed systems, AI-native SDLC        |
| `...Resume.pdf`                          | Agentic coding engineer, MCP servers, agentvcr |
| `...CV.pdf` / `...Resume_full_stack.pdf` | General software engineer                      |

A portfolio can't tilt. If it leads with Django it reads "backend guy who dabbles"; if it leads with 3JS it reads "frontend guy". Your ask — _"devops backend ai engineering fullstack everything must be balanced"_ — is a real design constraint, not a preference.

**The idea: a Role Lens.**

A persistent control in the hero — `Backend · Platform/DevOps · AI Engineering · Full-Stack` — that re-weights the _entire page_: the headline sentence, the metric bar, the ordering and emphasis of case studies, the skill grid, and even **which of your existing CV PDFs the Download button serves**. Nothing is hidden; everything re-ranks with an animated transition (FLIP layout animation, so cards visibly travel to their new positions).

Why this wins:

- **Balance is structural, not rhetorical.** Every pillar gets identical real estate and identical depth of evidence. No pillar is the default; the visitor picks.
- **It's the single most-shared interaction on the site.** Recruiters remember "the portfolio where the whole page rearranged."
- **It reuses assets you already have.** Five tailored PDFs become five targeted download paths instead of five files rotting in `~/Downloads`.
- **It is itself a seniority signal** — it shows you understand that different audiences need different framings of the same system.

Default lens on first load: **Full-Stack** (widest net), with the other three visibly available and a subtle one-time pulse on the control.

---

## 2. Tech stack

| Concern         | Choice                                                                                | Why                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | **Next.js 15 (App Router) + TypeScript**                                              | `output: 'export'` → static HTML; deploys to GH Pages _and_ Vercel from the same build. No lock-in.                                               |
| Styling         | **Tailwind CSS v4** + CSS custom properties                                           | v4's `@theme` gives one token source shared by CSS and R3F materials.                                                                             |
| 3D              | **three.js + @react-three/fiber + @react-three/drei** + `@react-three/postprocessing` | Declarative 3D that lives inside React state — the hero must react to the Role Lens.                                                              |
| Motion          | **`motion` (Framer Motion)** for layout/FLIP + scroll, **Lenis** for smooth scroll    | `layoutId` handles the lens re-ordering for free. GSAP is free now too, but Framer's layout animations are the exact primitive this design needs. |
| Content         | Typed TS objects under `content/`                                                     | Single source of truth; every section is derived, nothing is hardcoded twice.                                                                     |
| Icons           | `lucide-react` + hand-authored inline SVG for architecture diagrams                   |                                                                                                                                                   |
| Analytics       | Vercel Analytics or Plausible (optional, one line)                                    |                                                                                                                                                   |
| Package manager | **pnpm** (already installed)                                                          |                                                                                                                                                   |

**Not using:** Spline (bloated, hosted dependency), template starters, generic purple-gradient AI aesthetic, particle-blob hero. All three read as junior.

---

## 3. Design direction

Dark-first, near-black `#07080A`, one electric accent, monospace numerals. The look should be **instrument panel / systems console**, not "creative agency". Your evidence is numbers and architecture — the design should treat numbers as the hero typography.

- **Type:** a strong grotesk for display (Inter Tight / Geist / Satoshi) + **JetBrains Mono** for every metric, tech chip, and code fragment. Metrics set at 4–6rem in mono is the whole visual identity.
- **Accent:** single accent, used sparingly (~5% of surface). Recommend a cool electric cyan `#4DE8FF` or a signal amber `#FFB347`. One accent, never a gradient of three.
- **Depth:** thin `1px` hairlines at 8% white, subtle grain overlay, no drop shadows. Elevation via border-luminosity, not blur.
- **Light mode:** required (recruiters print pages, and `prefers-color-scheme: light` is common on corporate machines). Token-swap only.
- **Motion vocabulary:** everything eases on one curve (`cubic-bezier(0.16, 1, 0.3, 1)`), 200–600ms. Consistency reads as senior; variety reads as showreel.

---

## 4. The hero 3D — what it actually is

Not a blob, not a globe, not floating tech logos.

**An animated event-mesh:** ~40 instanced nodes in loose 3D orbit, connected by edges, with **packets travelling along the edges** — small emissive instanced particles that move node-to-node, occasionally batching and bursting. It is a literal visualisation of the thing you build: Postgres → outbox → Kafka → Redis → Elasticsearch, event propagation with at-least-once delivery.

Behaviour:

- Slow autonomous drift; **cursor exerts a soft repulsion field** (raycast against an invisible plane, apply falloff to node velocities).
- **The Role Lens re-colours and re-labels it.** Backend → nodes labelled with datastores, dense edges. DevOps → nodes become containers/replicas, packets become deploy waves rolling through. AI → packets become token streams flowing to a central inference node and back. Full-Stack → the mesh splits into a client tier and a service tier with requests crossing between. Same geometry, animated re-interpretation. This is what makes the lens feel _alive_ rather than a filter.
- Bloom postprocessing at low intensity on the packets only (selective bloom), nothing else.

**Performance contract (non-negotiable — this is the part that signals senior):**

- Canvas is `next/dynamic` with `ssr: false`, loaded after first paint; a static pre-rendered still (WebP) is the placeholder so LCP never waits on WebGL.
- `dpr={[1, 1.75]}` adaptive; drei `<AdaptiveDpr>` + `<AdaptiveEvents>`.
- `frameloop="demand"` where possible; **pause entirely via IntersectionObserver** when the hero scrolls out.
- `prefers-reduced-motion` → render one static frame, no loop.
- Feature-detect: no WebGL2, or `navigator.hardwareConcurrency <= 4`, or `deviceMemory < 4` → serve an animated SVG/CSS fallback mesh instead. Mobile always gets the light path.
- Hard budget: **< 250KB gzip for the three bundle**, hero interactive < 2.5s on a mid-tier Android over 4G.

---

## 5. Page structure

```
1  Hero              name, senior one-liner, ROLE LENS, 3D event-mesh, scroll cue
2  Proof bar         8 metrics, count-up on enter, mono numerals, lens re-orders them
3  Four Pillars      Backend · Platform/DevOps · AI Engineering · Full-Stack
                     equal cards, each expands to evidence + linked projects
4  Selected Work     Balanzify · GoStyle · agentvcr · Rhombus · Playzone
                     + Orbit · Twinflow · University ERP (secondary grid)
                     each card tagged with pillar chips; lens re-ranks with FLIP
5  Deep Dive         ONE signature interactive architecture diagram (see §6)
6  Experience        JumaTechs 2026–present · Code Prophet 2024–2026
                     scroll-driven timeline, subtle parallax
7  Stack             grouped skill grid, lens dims non-relevant groups (never hides)
8  Signals           Meta Hacker Cup 2025 Round 2 · PyPI + npm packages · B.Sc. CS 2025
9  Contact           email, GitHub, LeetCode, lens-aware CV download
```

**Content sourcing note:** every metric on the site is already load-bearing in your CVs — 350+ endpoints, 600+ models, 40+ Django apps, <300ms p95 @ ~1,000 req/min, 500+ concurrent WebSockets, 114 tables / 116 migrations, 18 versioned libraries, ~392 test files, Meta Hacker Cup Round 2. Nothing gets invented. The proof bar rotates which eight are foregrounded per lens.

### Pillar evidence map (this is how balance is _proved_, not claimed)

| Pillar                | Headline evidence                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**           | 600+ models / 350+ DRF endpoints across 40+ apps; 114-table schema, 116 migrations; money as integer fils; partial unique indexes; hexagonal + CQRS across 18 libraries; transactional outbox + per-tenant encrypted idempotency                                                                              |
| **Platform / DevOps** | AWS CodeBuild→CodeDeploy→EC2; Docker Swarm & Kubernetes; GitHub Actions; zero-downtime deploys; Prometheus/Grafana/Loki; ~392 tests against a real Postgres container in CI; ESLint boundary enforcement as an architectural CI gate; Orbit (container orchestrator, Go)                                      |
| **AI Engineering**    | agentvcr — record/replay proxy, request fingerprinting, positional replay, semantic LCS differ, warn/strict/live-on-miss, validated on LangGraph + OpenAI Agents SDK; production LLM categorisation (OpenAI/Groq); GPT-4 Vision + Tesseract receipt OCR; RAG/pgvector; custom MCP servers; token-cost control |
| **Full-Stack**        | React/Vite agentvcr diff UI with mid-run editor; Next.js + Tailwind Playzone with sub-second Socket.IO sync and reconnect/turn-state handling; Django Channels + Redis pub/sub real-time chat; end-to-end ownership from schema to UI                                                                         |

---

## 6. The signature deep-dive (the section that separates this from every other portfolio)

Most portfolios stop at "here are my projects." Yours should contain **one genuinely technical, interactive explainer** — hand-built inline SVG with `motion` path animation, ~60 seconds of engagement.

Recommended subject: **agentvcr's record/replay loop**, because it's uniquely yours, it's open-source and verifiable, and it sits at the intersection of AI + backend + tooling — the exact balance point the whole site is arguing for.

Interactive states: `RECORD` (agent → proxy → provider, tape written) → `REPLAY` (agent → proxy → tape, zero tokens) → `DIVERGENCE` (fingerprint mismatch highlighted, first divergence flagged) → `FORK` (edit a step, re-run from there). Clicking through the states animates packets along the diagram paths.

Alternative if you'd rather lead with distributed systems: the **transactional outbox** flow from Rhombus (atomic write + event publish, no distributed transaction, at-least-once downstream). Pick one — two would dilute it.

---

## 7. Architecture of the codebase

```
app/
  layout.tsx              fonts, theme tokens, LensProvider, Lenis
  page.tsx                composes sections
  opengraph-image.tsx     generated OG card (next/og)
content/
  profile.ts              name, taglines (one per lens), contact, links
  metrics.ts              Metric[] with pillar weights
  pillars.ts              4 pillars, evidence bullets, project refs
  projects.ts             Project[] with pillars[], stack[], links, metrics[]
  experience.ts           roles
  stack.ts                grouped skills with pillar tags
  cvs.ts                  lens → PDF filename map
components/
  lens/                   LensProvider, LensSwitch, useLens, useLensRank
  hero/                   Hero, EventMesh (R3F), MeshFallback, HeroStill
  sections/               ProofBar, Pillars, Work, DeepDive, Timeline, Stack, Signals, Contact
  primitives/             Reveal, CountUp, Chip, Card, Cursor, GrainOverlay
lib/
  motion.ts               shared easings/variants — one vocabulary, enforced
  perf.ts                 capability detection, reduced-motion, IO hooks
public/
  cv/                     the 5 PDFs, renamed cleanly
  hero-still.webp
```

Rule: **no section component contains a hardcoded fact.** Everything reads from `content/`. That makes the lens implementation trivial (`sortBy(project.pillars[lens].weight)`) and makes future edits a one-file change.

---

## 8. Build phases

| Phase                  | Work                                                                                                                                       | Est. |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| **P0 — Scaffold**      | Next 15 + TS + Tailwind v4, `output: 'export'`, fonts, ESLint/Prettier, base tokens, dark/light                                            | 0.5d |
| **P1 — Content layer** | Extract all six PDFs into typed `content/*.ts`; assign pillar weights; rename & stage the 5 CVs in `public/cv/`                            | 0.5d |
| **P2 — Lens engine**   | `LensProvider` (URL-synced `?lens=ai` so links are shareable), `LensSwitch` UI, ranking hooks, FLIP transitions                            | 0.5d |
| **P3 — Hero 3D**       | R3F event-mesh, instanced nodes + edges + packets, cursor field, 4 lens variants, bloom, full perf contract + fallbacks                    | 1.5d |
| **P4 — Sections**      | ProofBar (count-up), Pillars, Work grid, Timeline, Stack, Signals, Contact                                                                 | 1.5d |
| **P5 — Deep dive**     | Hand-authored SVG diagram + 4 animated states                                                                                              | 1d   |
| **P6 — Motion pass**   | Scroll reveals, Lenis, sticky/pin moments, page transitions, unified easing audit                                                          | 0.5d |
| **P7 — Perf & a11y**   | Lighthouse ≥95 all four, axe clean, keyboard path through lens + cards, focus rings, `prefers-reduced-motion` full audit, real-device test | 0.5d |
| **P8 — SEO & ship**    | Metadata, JSON-LD `Person`, per-lens OG images, sitemap/robots, GH Actions → Pages (or Vercel), custom domain                              | 0.5d |

**~7 working days.** P0–P4 alone (~4.5d) is already a shippable site; P5–P8 is what makes it memorable.

---

## 9. Quality bar (the definition of done)

- Lighthouse mobile: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100
- LCP < 1.8s, CLS < 0.05, INP < 200ms on mid-tier Android / 4G
- Full keyboard operability, including the Role Lens and every project card
- `prefers-reduced-motion: reduce` → zero looping animation, site fully legible
- No WebGL → site fully functional, fallback mesh renders
- Prints cleanly to PDF (print stylesheet; recruiters do this)
- Every claim on the page traceable to a CV line — no inflation

---

## 10. Decisions I made for you (flag any you'd change)

1. **Default lens = Full-Stack.** Widest audience; the others are one click away.
2. **Static export**, so the same artifact deploys to GH Pages or Vercel. Costs nothing, removes a lock-in.
3. **One accent colour, no gradients.** The 3D mesh is the visual spectacle; the layout stays disciplined. Two spectacles compete.
4. **Deep dive = agentvcr**, not the outbox — it's the most distinctly _yours_ and it's publicly verifiable on PyPI/npm.
5. **Titles.** Site headline reads **"Software Engineer · Systems, Platforms & AI"** with a lens-specific subline, rather than picking one of your five CV titles.

## 11. Open questions

- **Contact email:** CVs say `omysaadislam@gmail.com`; this machine's git identity is `entitytch@gmail.com`. Which goes on the site?
- **Custom domain?** (e.g. `saadislam.dev`) — affects the GH Pages `basePath` config, so worth deciding before P0.
- **Photo or no photo?** A portrait warms the hero considerably; the systems-console aesthetic works without one.
- **Balanzify / GoStyle screenshots** — are they shareable? Real product screenshots would strengthen the Work section a lot. If NDA'd, the case studies stay diagram-and-metrics based (which still works).
- **Accent colour:** electric cyan `#4DE8FF` or signal amber `#FFB347`?
