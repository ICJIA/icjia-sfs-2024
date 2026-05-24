#!/usr/bin/env node
/**
 * audit-lh.mjs — Lighthouse mobile audit wrapper (per checklist §14).
 *
 *   pnpm audit:lh                  # homepage
 *   pnpm audit:lh -- /about        # specific route
 *   pnpm audit:lh -- --all         # every page in dist/ (slow)
 *
 * Probes a free port, spawns `pnpm preview` in its own process group,
 * waits for the server, runs lighthouse via `pnpm dlx`, parses the
 * report, prints a per-route summary, then cleans up via SIGTERM →
 * SIGKILL on the whole process group so Ctrl-C doesn't orphan astro
 * preview.
 *
 * Reports land in reports/ (gitignored).
 */
import { spawn } from "node:child_process";
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import net from "node:net";

const PORT = 4322;
const HOST = "127.0.0.1";
const ORIGIN = `http://${HOST}:${PORT}`;
const REPORTS = resolve(process.cwd(), "reports");
const ARGV = process.argv.slice(2);
const ALL = ARGV.includes("--all");
const ROUTES = ALL
  ? null // populated after dist scan
  : ARGV.filter((a) => a.startsWith("/")).length
    ? ARGV.filter((a) => a.startsWith("/"))
    : ["/"];

function portFree(port) {
  return new Promise((res) => {
    const s = net.createServer();
    s.once("error", () => res(false));
    s.once("listening", () => s.close(() => res(true)));
    s.listen(port, HOST);
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      if (r.ok || r.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error(`server at ${url} not ready within ${timeoutMs}ms`);
}

async function collectRoutes() {
  const dist = resolve(process.cwd(), "dist");
  const files = [];
  async function walk(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile() && e.name.endsWith(".html")) files.push(p);
    }
  }
  await walk(dist);
  return files
    .map((f) => f.replace(dist, "").replace(/\\/g, "/"))
    .map((f) => (f === "/index.html" ? "/" : f.replace(/\.html$/, "")))
    .filter((r) => !r.includes("/404"));
}

if (!(await portFree(PORT))) {
  console.error(`audit-lh: port ${PORT} is in use. Free it or change PORT.`);
  process.exit(1);
}

console.log(`audit-lh: starting pnpm preview on ${ORIGIN}…`);
const preview = spawn("pnpm", ["preview", "--port", String(PORT), "--host", HOST], {
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
});

const cleanup = (code = 0) => {
  try {
    process.kill(-preview.pid, "SIGTERM");
    setTimeout(() => {
      try {
        process.kill(-preview.pid, "SIGKILL");
      } catch {}
    }, 2000);
  } catch {}
  process.exit(code);
};
process.on("SIGINT", () => cleanup(130));
process.on("SIGTERM", () => cleanup(143));

try {
  await waitForServer(ORIGIN + "/");
  await mkdir(REPORTS, { recursive: true });

  const routes = ALL ? await collectRoutes() : ROUTES;
  console.log(`audit-lh: auditing ${routes.length} route(s) on mobile…\n`);

  const summary = [];
  for (const route of routes) {
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
    const reportPath = join(REPORTS, `lh-${slug}.json`);

    const lh = spawn(
      "pnpm",
      [
        "dlx",
        "lighthouse",
        ORIGIN + route,
        "--output=json",
        "--output-path=" + reportPath,
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
        "--preset=desktop", // overwritten below to mobile via form-factor
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--screenEmulation.width=375",
        "--screenEmulation.height=812",
        "--screenEmulation.deviceScaleFactor=3",
        "--throttling.cpuSlowdownMultiplier=4",
        "--only-categories=performance,accessibility,best-practices,seo",
      ],
      { stdio: "inherit" },
    );
    await new Promise((res) => lh.on("close", res));

    try {
      const data = JSON.parse(await readFile(reportPath, "utf8"));
      const s = (k) => Math.round((data.categories[k]?.score ?? 0) * 100);
      const row = {
        route,
        perf: s("performance"),
        a11y: s("accessibility"),
        bp: s("best-practices"),
        seo: s("seo"),
      };
      summary.push(row);
    } catch {
      summary.push({ route, perf: "?", a11y: "?", bp: "?", seo: "?" });
    }
  }

  console.log("\n=== Lighthouse mobile summary ===");
  console.log("Route                          Perf  A11y  BP    SEO");
  for (const r of summary) {
    console.log(
      `${r.route.padEnd(30)} ${String(r.perf).padStart(4)}  ${String(r.a11y).padStart(4)}  ${String(r.bp).padStart(4)}  ${String(r.seo).padStart(4)}`,
    );
  }
  await writeFile(
    join(REPORTS, "lh-summary.json"),
    JSON.stringify(summary, null, 2),
  );
} finally {
  cleanup(0);
}
