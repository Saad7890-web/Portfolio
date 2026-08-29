#!/usr/bin/env node
/**
 * Give the generated metadata images a file extension.
 *
 * `next/og` metadata routes export as extension-less files — `out/opengraph-image`
 * holding PNG bytes — because in a server deployment the route sets its own
 * Content-Type header. A static host has no route: it reads the extension and
 * nothing else, so every one of those cards would be served as text/plain and
 * every share preview on Twitter, Slack and LinkedIn would silently fall back
 * to a bare link. The failure is invisible from the built output, which is why
 * this runs on every build rather than living in a deploy checklist.
 *
 * The `?<hash>` cache-buster Next appends survives: it moves behind the new
 * extension, so a crawler that cached the old card still refetches.
 */
import { readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out';

/** Metadata routes that emit an image, by the extension their bytes need. */
const IMAGE_ROUTES = new Map([
  ['opengraph-image', 'png'],
  ['twitter-image', 'png'],
]);

/** Files whose contents reference those URLs: HTML and the RSC flight payloads. */
const REWRITABLE = /\.(html|txt|json|js)$/;

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const files = walk(OUT);
const renamed = [];

for (const path of files) {
  const name = path.split(sep).pop();
  const ext = IMAGE_ROUTES.get(name);
  if (!ext) continue;

  renameSync(path, `${path}.${ext}`);
  // Leading slash, POSIX separators: this is the URL as it appears in markup,
  // not a filesystem path.
  renamed.push({ url: `/${relative(OUT, path).split(sep).join('/')}`, ext });
}

if (renamed.length === 0) {
  console.log('finalize-export: no metadata images to rename');
  process.exit(0);
}

// Longest URL first, so /lens/ai/opengraph-image is matched before the shorter
// /opengraph-image that is a suffix of it.
renamed.sort((a, b) => b.url.length - a.url.length);

let touched = 0;
for (const path of files) {
  if (!REWRITABLE.test(path)) continue;

  const before = readFileSync(path, 'utf8');
  let after = before;

  for (const { url, ext } of renamed) {
    // The URL must end where it is matched — at a quote, an escaped quote, a
    // tag boundary or the cache-buster — or /opengraph-image would also match
    // inside the path we have already rewritten to /opengraph-image.png.
    after = after.replace(new RegExp(`${escapeRe(url)}(?=[?"'\\\\<\\s])`, 'g'), `${url}.${ext}`);
  }

  if (after !== before) {
    writeFileSync(path, after);
    touched += 1;
  }
}

console.log(
  `finalize-export: renamed ${renamed.length} metadata image(s), rewrote ${touched} file(s)`,
);
