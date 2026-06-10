#!/usr/bin/env node
/**
 * csp-hashes.mjs — print every unique sha256 hash for inline <script>s
 * across dist/. Run after `pnpm build` whenever a CSP report shows a
 * blocked inline script; copy the list into netlify.toml + _headers.
 *
 *   pnpm build && node scripts/csp-hashes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import c from "node:crypto";

const DIST = "dist";
const hashes = new Map();

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && e.name.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf8");
      // Match every <script>…</script> WITHOUT a src= attribute. We capture
      // the attribute string (group 1) so we can skip data blocks — CSP
      // doesn't enforce on type="application/ld+json" or any other
      // non-executable type, so hashing them only adds noise.
      const rx = /<script\b((?![^>]*\bsrc=)[^>]*)>([\s\S]*?)<\/script>/g;
      let m;
      while ((m = rx.exec(html)) !== null) {
        const attrs = m[1] ?? "";
        const body = m[2];
        if (/\btype\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue;
        const h =
          "sha256-" +
          c.createHash("sha256").update(body, "utf8").digest("base64");
        if (!hashes.has(h)) {
          hashes.set(h, {
            preview: body.slice(0, 80).replace(/\s+/g, " ").trim(),
            files: new Set(),
          });
        }
        hashes.get(h).files.add(p.replace(DIST + "/", ""));
      }
    }
  }
}

walk(DIST);

console.log(`Found ${hashes.size} unique inline-script hashes:\n`);
for (const [h, info] of hashes) {
  const fileList = [...info.files];
  const scope =
    fileList.length > 5 ? `${fileList.length} files` : fileList.join(", ");
  console.log(`'${h}'`);
  console.log(`  in: ${scope}`);
  console.log(`  preview: ${info.preview}`);
  console.log();
}

console.log("CSP script-src snippet (paste after 'self'):");
console.log([...hashes.keys()].map((h) => `'${h}'`).join(" "));
