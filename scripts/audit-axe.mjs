#!/usr/bin/env node
/**
 * audit-axe.mjs — @axe-core/cli wrapper (per checklist §14).
 *
 *   pnpm audit:axe                 # homepage
 *   pnpm audit:axe -- /about       # specific route
 *   pnpm audit:axe -- --all        # every page in dist/
 *
 * Same harness as audit-lh.mjs (port probe, detached preview, process-
 * group cleanup) but invokes @axe-core/cli instead of lighthouse.
 * Reports land in reports/.
 */
import { spawn } from "node:child_process";
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import net from "node:net";

const PORT = 4323;
const HOST = "127.0.0.1";
const ORIGIN = `http://${HOST}:${PORT}`;
const REPORTS = resolve(process.cwd(), "reports");
const ARGV = process.argv.slice(2);
const ALL = ARGV.includes("--all");
const ROUTES = ALL
  ? null
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
  console.error(`audit-axe: port ${PORT} is in use. Free it or change PORT.`);
  process.exit(1);
}

console.log(`audit-axe: starting pnpm preview on ${ORIGIN}…`);
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
  console.log(`audit-axe: auditing ${routes.length} route(s)…\n`);

  const summary = [];
  for (const route of routes) {
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
    const reportPath = join(REPORTS, `axe-${slug}.json`);

    const axe = spawn(
      "pnpm",
      [
        "dlx",
        "@axe-core/cli",
        ORIGIN + route,
        "--save",
        reportPath,
        "--exit",
      ],
      { stdio: "inherit" },
    );
    const code = await new Promise((res) => axe.on("close", res));

    try {
      const data = JSON.parse(await readFile(reportPath, "utf8"));
      const arr = Array.isArray(data) ? data[0] : data;
      const violations = arr?.violations?.length ?? 0;
      summary.push({ route, violations, exit: code });
    } catch {
      summary.push({ route, violations: "?", exit: code });
    }
  }

  console.log("\n=== axe-core summary ===");
  console.log("Route                          Violations");
  for (const r of summary) {
    console.log(
      `${r.route.padEnd(30)} ${String(r.violations).padStart(4)}`,
    );
  }
  await writeFile(
    join(REPORTS, "axe-summary.json"),
    JSON.stringify(summary, null, 2),
  );
} finally {
  cleanup(0);
}
