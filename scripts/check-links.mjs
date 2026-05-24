#!/usr/bin/env node
/**
 * check-links.mjs — broken-link scanner for the built site.
 *
 * Walks every dist/** /*.html, parses out hrefs, and reports anything that
 * doesn't resolve. Adapted from the v2 checklist §13 pattern with the
 * format: "file" output layout in mind (Astro emits /about.html, not
 * /about/index.html, here).
 *
 *   pnpm check:links             # internal + external
 *   pnpm check:links:internal    # filesystem-only (fast, CI-friendly)
 *
 * Internal failures fail the run (exit 1). External failures warn and
 * exit 0 — third-party rot is real and usually out of your control.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST = resolve(process.cwd(), "dist");
const ARGV = process.argv.slice(2);
const INTERNAL_ONLY = ARGV.includes("--internal-only");
const VERBOSE = ARGV.includes("--verbose");

// rels that are metadata, not navigable URLs — skip these even on internal scan
const SKIP_RELS = new Set([
  "canonical",
  "alternate",
  "preload",
  "prefetch",
  "preconnect",
  "dns-prefetch",
  "manifest",
  "stylesheet",
  "modulepreload",
  "icon",
  "shortcut icon",
  "apple-touch-icon",
  "mask-icon",
]);

const HREF_RX = /<(a|link)\b([^>]*)>/gi;
const ATTR_RX = /(\w[\w-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

function parseTag(rawAttrs) {
  const out = {};
  for (const m of rawAttrs.matchAll(ATTR_RX)) {
    out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  }
  return out;
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(p)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

function resolveInternal(href) {
  // strip query + hash
  const clean = decodeURIComponent(href.split("#")[0].split("?")[0]);
  if (!clean || clean === "/") return join(DIST, "index.html");
  if (clean.startsWith("/_astro/")) return join(DIST, clean);
  // public/-rooted files (favicon, robots, og-image, splash that stayed in public, pdfs/docx, etc.)
  if (/\.[a-z0-9]+$/i.test(clean)) return join(DIST, clean);
  // bare path → /about.html (format: "file")
  const flat = join(DIST, clean + ".html");
  if (existsSync(flat)) return flat;
  // …or /about/index.html (format: "directory" fallback, just in case)
  return join(DIST, clean, "index.html");
}

async function headCheck(url) {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return r.status;
  } catch (e) {
    return `err:${e.code ?? e.name ?? "unknown"}`;
  }
}

const broken = { internal: [], external: [] };
const seen = { internal: new Set(), external: new Set() };

const htmlFiles = await walk(DIST);
console.log(`Scanning ${htmlFiles.length} HTML files in dist/…`);

for (const file of htmlFiles) {
  const src = await readFile(file, "utf8");
  for (const m of src.matchAll(HREF_RX)) {
    const tag = m[1].toLowerCase();
    const attrs = parseTag(m[2]);
    const href = attrs.href;
    if (!href) continue;
    // skip rel-based hints
    if (tag === "link") {
      const rels = (attrs.rel ?? "").toLowerCase().split(/\s+/);
      if (rels.some((r) => SKIP_RELS.has(r))) continue;
    }
    // skip non-http(s) and same-page anchors / mailto / tel
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:") ||
      href.startsWith("data:")
    ) {
      continue;
    }

    if (/^https?:\/\//i.test(href)) {
      if (INTERNAL_ONLY) continue;
      if (seen.external.has(href)) continue;
      seen.external.add(href);
      const status = await headCheck(href);
      if (typeof status !== "number" || status >= 400) {
        broken.external.push({ file, href, status });
        if (VERBOSE) console.log(`  ✗ external ${status}  ${href}  (${file})`);
      } else if (VERBOSE) {
        console.log(`  ✓ external ${status}  ${href}`);
      }
    } else if (href.startsWith("/")) {
      if (seen.internal.has(href)) continue;
      seen.internal.add(href);
      const target = resolveInternal(href);
      try {
        await stat(target);
        if (VERBOSE) console.log(`  ✓ internal       ${href}`);
      } catch {
        broken.internal.push({ file, href, target });
        if (VERBOSE) console.log(`  ✗ internal       ${href} → ${target}  (${file})`);
      }
    }
    // relative hrefs (no leading slash) are out of scope — Astro
    // shouldn't emit them in a `site:`-rooted build
  }
}

console.log();
console.log(`Internal scanned: ${seen.internal.size}, broken: ${broken.internal.length}`);
if (!INTERNAL_ONLY) {
  console.log(`External scanned: ${seen.external.size}, broken: ${broken.external.length}`);
}

if (broken.internal.length) {
  console.log("\n--- Broken internal links ---");
  for (const b of broken.internal) {
    console.log(`  ${b.href}`);
    console.log(`    in: ${b.file}`);
    console.log(`    looked for: ${b.target}`);
  }
}

if (broken.external.length) {
  console.log("\n--- Broken external links (warning, not failing) ---");
  for (const b of broken.external) {
    console.log(`  ${b.status}  ${b.href}`);
    console.log(`    in: ${b.file}`);
  }
}

if (broken.internal.length) {
  console.error("\n✗ internal link check failed");
  process.exit(1);
}
console.log("\n✓ link check passed");
