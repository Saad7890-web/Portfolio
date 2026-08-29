# Deploying

The site is a static export (`output: 'export'`). `pnpm build` writes a plain
folder of HTML, CSS, JS, PNG and PDF to `out/` — no server, no runtime, no
lock-in. Vercel is the primary host; the GitHub Pages workflow exists so that
claim stays true.

---

## The one setting that matters

`NEXT_PUBLIC_SITE_URL`.

Everything absolute is built from it — `og:image`, `og:url`, the JSON-LD `@id`s,
`sitemap.xml`, the `Sitemap:` line in `robots.txt`, and the host printed in the
corner of the share card. It is baked in **at build time**, so changing it means
a redeploy, not a restart.

Get it wrong and nothing looks broken: the site loads, and only the link
previews quietly fail. Set it before the first deploy anyone sees.

No trailing slash. Include the scheme.

---

## Vercel

1. Push the repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), **Import** the `Portfolio` repo.
   Vercel detects Next.js and pnpm on its own — leave the build command,
   output directory and install command alone.
3. Before clicking Deploy, open **Environment Variables** and add:

   | Name                   | Value                               |
   | ---------------------- | ----------------------------------- |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` |

   Leave `NEXT_PUBLIC_BASE_PATH` unset — it is for GitHub Pages only, and
   setting it here would break every asset path on the site.

4. Deploy. Every later push to `main` redeploys; pushes to other branches get
   their own preview URL.

### Adding a custom domain

1. Project → **Settings → Domains** → add the domain, and set the DNS records
   Vercel shows you at your registrar.
2. Change `NEXT_PUBLIC_SITE_URL` to the custom domain.
3. **Redeploy** — Deployments → the latest one → ⋯ → Redeploy. Without this the
   share cards still point at the old `.vercel.app` host, because that value was
   compiled into the HTML.

### What `vercel.json` does

Sets response headers, which `next.config.ts` cannot: `headers()` is a server
feature and this build has no server. Security headers on everything, immutable
caching on `/_next/static`, short caching on the CVs so a replaced PDF is picked
up the same day.

---

## GitHub Pages

Already wired: `.github/workflows/pages.yml` builds and publishes on every push
to `main`. One-time setup — repo **Settings → Pages → Source: GitHub Actions**.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/Portfolio` and a matching
`NEXT_PUBLIC_SITE_URL`, because a project page is served from a sub-path. Both
have to agree; edit them together or not at all. On a custom domain, delete both
lines and set the site URL to the domain.

---

## Before you ship

```bash
pnpm typecheck && pnpm lint && pnpm check:contrast && pnpm build
```

Then check what the crawler will see:

- `out/index.html` — one `<h1>`, the JSON-LD block, `og:image` pointing at an
  absolute URL on your host
- `out/opengraph-image.png` and `out/lens/*/opengraph-image.png` — five cards,
  1200×630
- `out/sitemap.xml` and `out/robots.txt` — both naming your real origin

Once it is live, paste the URL into
[Rich Results Test](https://search.google.com/test/rich-results) for the
structured data and into a Slack DM to yourself for the share card. Then add
the property in [Search Console](https://search.google.com/search-console) and
submit `/sitemap.xml`.

---

## Why the build has a second step

`pnpm build` runs `next build && node scripts/finalize-export.mjs`.

`next/og` metadata routes export as extension-less files — `out/opengraph-image`
holding PNG bytes — because in a server deployment the route sets its own
`Content-Type`. A static host has no route: it reads the extension and nothing
else, so those cards would go out as `text/plain` and every share preview would
fall back to a bare link. The script renames them and rewrites the references.
It runs on every build so the failure can't come back unnoticed.
