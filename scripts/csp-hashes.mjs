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
      const rx = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
      let m;
      while ((m = rx.exec(html)) !== null) {
        const h =
          "sha256-" +
          c.createHash("sha256").update(m[1], "utf8").digest("base64");
        if (!hashes.has(h)) {
          hashes.set(h, {
            preview: m[1].slice(0, 80).replace(/\s+/g, " ").trim(),
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

console.log("CSP script-src snippet (paste between 'self' and 'unsafe-eval'):");
console.log([...hashes.keys()].map((h) => `'${h}'`).join(" "));
