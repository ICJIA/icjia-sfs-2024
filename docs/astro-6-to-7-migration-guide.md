# Astro 6 → 7 Migration Guide (ICJIA, 2026-08-10)

> Written from the `sfs.icjia.illinois.gov` upgrade (Astro **6.4.6 → 7.2.0**),
> generalized for the rest of the ICJIA portfolio. Companion to
> `astro-conversion-checklist-v6.4.md`, which covers Vue/Nuxt → Astro
> conversion; this file covers **only** the 6 → 7 major bump.
>
> **The headline:** the build succeeds and the site looks fine even when the
> migration is wrong. Both of the serious defects below ship green. Neither
> throws, neither warns, and neither is visible in a build log. Plan to
> **diff rendered output**, not to read error messages.

## Contents

- [The 60-second version](#the-60-second-version)
- [Trap 1 — markdown plugins stop running, silently](#trap-1--markdown-plugins-stop-running-silently)
- [Trap 2 — `compressHTML` eats spaces between words](#trap-2--compresshtml-eats-spaces-between-words)
- [Trap 3 — CSP inline-script hashes all rotate](#trap-3--csp-inline-script-hashes-all-rotate)
- [Trap 4 — `astro dev` is now a background daemon](#trap-4--astro-dev-is-now-a-background-daemon)
- [The rest of the breaking changes](#the-rest-of-the-breaking-changes)
- [Ecosystem versions](#ecosystem-versions)
- [The verification method that actually works](#the-verification-method-that-actually-works)
- [`dev-server.sh` — adopt it on Astro 6 first](#dev-serversh--adopt-it-on-astro-6-first)
- [Is it faster? Measured numbers](#is-it-faster-measured-numbers)
- [Order of operations](#order-of-operations)
- [Links](#links)

---

## The 60-second version

```bash
# 1. Branch. This is a major bump; it gets its own PR.
git checkout -b chore/astro-7

# 2. Capture a baseline BEFORE upgrading. You cannot verify without it.
pnpm build && cp -R dist /tmp/baseline-v6

# 3. Upgrade. Add markdown-remark ONLY if you use remark/rehype plugins.
pnpm add astro@7 @astrojs/markdown-remark@7.2.2

# 4. Config edits (details below):
#    - markdown.rehypePlugins/remarkPlugins  ->  markdown.processor: unified({...})
#    - add compressHTML: true
#
# 5. Rebuild and diff rendered output against the baseline.
# 6. Regenerate CSP hashes if you pin inline-script hashes.
```

Astro 7 requires **Node ≥ 22.12.0** and bundles **Vite 8**.

---

## Trap 1 — markdown plugins stop running, silently

**This is the one that will bite ICJIA sites hardest.** Every site in the
portfolio authors content as markdown with raw HTML, and several use
`rehype-external-links` to auto-decorate outbound links.

Astro 7 changes the **default markdown processor** from remark/rehype to
**Sätteri**, a native pipeline with its own plugin model. `@astrojs/markdown-remark`
is no longer bundled — it is now an *optional* peer dependency pinned to an
exact version.

The failure mode is the problem:

> `markdown.remarkPlugins` and `markdown.rehypePlugins` are not errors under
> Astro 7. They are **ignored**. The build succeeds, the pages render, and your
> plugins simply never run.

On SFS that would have silently stripped `target="_blank"` and
`rel="noopener noreferrer"` from every external link on the site — an
accessibility and security regression with a completely clean build log.

### The fix

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";   // <- new import
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  markdown: {
    processor: unified({
      rehypePlugins: [
        [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
      ],
      // remarkPlugins: [...] goes here too
    }),
  },
});
```

Install the exact pinned version — Astro 7.2.0 declares
`peerDependencies: { "@astrojs/markdown-remark": "7.2.2" }`:

```bash
pnpm add @astrojs/markdown-remark@7.2.2
```

### Markdown tips and gotchas

| Question | Answer |
|---|---|
| **Do I need `@astrojs/markdown-remark` at all?** | Only if you use remark/rehype plugins, or need Recma plugins in MDX. Plain markdown with no plugins renders identically under Sätteri — do nothing. |
| **Where did `syntaxHighlight` / `shikiConfig` go?** | Nowhere. They remain **top-level `markdown` options**, not processor options. Don't move them into `unified()`. |
| **What about `gfm` / `smartypants`?** | Applied automatically. The standalone `markdown.gfm` / `markdown.smartypants` flags are deprecated in favour of passing options to `unified()`. |
| **Does `markdown.processor` affect `.mdx`?** | **No.** MDX has its own `processor` option. Setting `markdown.processor` does not change `.mdx` files — set it on the MDX integration separately if you need it. |
| **Recma plugins?** | Sätteri does **not** support them. If your MDX depends on Recma, you must use `unified()` for MDX. |
| **Raw HTML in markdown?** | Still works, but see Trap 2 — whitespace handling around inline tags changes, and the new compiler is stricter about unclosed tags. |
| **The v6 deprecation warning** | Astro 6.4.x already warns: *"`markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` are deprecated."* **That warning is the migration notice.** If you see it in a v6 dev log, this trap applies to you. |

> **Do this before you upgrade:** run `pnpm dev` on Astro 6 and read the first
> few lines. If that deprecation warning appears, you have plugins to migrate.

---

## Trap 2 — `compressHTML` eats spaces between words

Astro 7 changes the `compressHTML` default from `true` (HTML-aware) to
`'jsx'` (JSX-style whitespace stripping). Whitespace between inline elements
is removed.

On SFS this corrupted **visible text on all 11 pages**:

| Page | Astro 6 | Astro 7 default |
|---|---|---|
| all (footer) | `© 2026 Illinois Criminal Justice…` | `© 2026Illinois Criminal Justice…` |
| `/` | `(SFS) program provides` | `(SFS) programprovides` |
| `/404` | `Visit the Resources page` | `Visit theResources page` |
| `/research` | `(2022). State fiscal year` | `(2022).State fiscal year` |

It happens wherever a text run meets an inline tag across a newline — which is
*normal, correct* formatting in both `.astro` templates and author-written
markdown:

```astro
<!-- Renders "© 2026Illinois…" under Astro 7's default -->
&copy; {year}
<a href="https://icjia.illinois.gov">Illinois Criminal Justice Information Authority</a>
```

### The fix

```js
export default defineConfig({
  compressHTML: true,   // restore Astro 6 semantics
});
```

Astro's upgrade guide suggests adding explicit spaces instead. **Don't** —
not for a content-managed site. You would be hand-auditing every inline
boundary in every template *and* in markdown that non-technical authors edit,
forever, with a silent text-corruption bug as the penalty for missing one.
Pin the old behaviour and move on.

> Byte-for-byte on SFS: 11/11 pages regress under `'jsx'`; 11/11 are identical
> to the v6 build under `true`.

---

## Trap 3 — CSP inline-script hashes all rotate

Every ICJIA site pins `sha256-` hashes for Astro's inlined `<script>` blocks in
`netlify.toml` **and** `public/_headers`. Astro 7's compiler re-minifies inline
scripts differently — backticks instead of quotes, shorter identifiers, `let`
over `const`.

On SFS, **3 of 4 hashes changed**. Stale hashes do not fail the build. They
fail in the browser, in production, on real users: the script is silently
blocked and whatever it powered simply stops working.

```bash
pnpm build && node scripts/csp-hashes.mjs
# paste into BOTH netlify.toml (all three CSP blocks:
# production, context.deploy-preview, context.branch-deploy)
# AND public/_headers
```

Two things worth internalizing:

- **Any Astro upgrade rotates these hashes**, not just majors. Add a
  regenerate-and-diff step to every dependency bump.
- **So does any edit to an inline script** — including whitespace. On SFS a
  content commit that rewrote one inline script shipped a stale hash and
  CSP-blocked that page's JS in production. It was invisible until someone
  asked about the deploy config.

Verify properly by serving `dist/` with the real CSP header enforced and
loading pages in a browser — a green build proves nothing here:

```python
# csp-server.py — serve dist/ with the production CSP actually applied
import http.server, functools, re, pathlib
hdr = pathlib.Path("public/_headers").read_text()
CSP = re.search(r"Content-Security-Policy:\s*(.+)", hdr).group(1).strip()
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Content-Security-Policy", CSP)
        super().end_headers()
http.server.HTTPServer(("127.0.0.1", 4600),
    functools.partial(H, directory="dist")).serve_forever()
```

Then confirm the scripts actually *ran* — not merely that the console is clean.
Check a side effect each script produces (a class it adds, an attribute it
sets). Absence of errors is not evidence of execution.

**Also worth a pass:** prune CSP entries for things you have removed. SFS still
allow-listed `https://illinois.maps.arcgis.com` in `frame-src` long after the
map embed was deleted.

---

## Trap 4 — `astro dev` is now a background daemon

In Astro 7, `astro dev` **daemonizes by default**. Verified on a real TTY: the
command prints its banner and *returns to the prompt*. The server keeps
running.

```
$ pnpm exec astro dev
Dev server running at http://localhost:4321 (pid 82898)
  Stop:   astro dev stop
  Status: astro dev status
  Logs:   astro dev logs
$                      # <- prompt is back; server is still up
```

Consequences:

- **Ctrl-C does nothing** — the command already exited.
- **Closing the terminal does not stop it.** The port stays held.
- **`kill` on the launching process group does not stop it.** This silently
  invalidated a first draft of our build benchmark: every "cold start" run was
  really measuring an already-running server.
- CI or scripts that shell out to `astro dev` will **leak daemons**.

New subcommands: `astro dev stop`, `astro dev status`, `astro dev logs [--follow]`,
and an explicit `--background` flag. `astro preview --background` arrived in 7.2
with the same shape.

> **Scripting gotcha:** `astro dev status` and `astro dev stop` **both exit 0**
> whether or not a server is running. You must branch on their message text
> (`"No dev server is running."`), never on the exit code. Output is a JSON
> envelope: `{"message":"…","label":"SKIP_FORMAT","level":"info"}`.

---

## The rest of the breaking changes

Everything below applied to zero of SFS's code, but will hit other sites.

| Change | What to do |
|---|---|
| **Vite 8** | Required. Most projects need no code change. Review the Vite 8 migration guide if you have custom Vite plugins or `vite.config` logic. Check plugin peers — `@tailwindcss/vite@4.3.3` declares `vite: ^5.2 \|\| ^6 \|\| ^7 \|\| ^8`, so it is fine. |
| **Rust compiler is the default** | Stricter about HTML validity. **Unclosed tags now error** instead of being silently accepted, and invalid nesting is no longer auto-corrected. Close every non-void element in `.astro` files *and* in raw HTML inside markdown. CSS values may serialize differently (cosmetic). |
| **Experimental flags graduated** | Delete these from `experimental`: `logger` (now top-level), `queuedRendering`, `rustCompiler`, `advancedRouting`, `cache`, `routeRules`. |
| **`src/fetch.ts` is reserved** | Advanced routing claims this filename. Rename yours, or set `fetchFile: './src/router.ts'` in the config. |
| **Container API import path** | `import { getContainerRenderer } from '@astrojs/react'` → `'@astrojs/react/container-renderer'`. Applies to React, Preact, Solid, Svelte, Vue, MDX. |
| **`@astrojs/db` removed** | Package is gone and unmaintained. Move to `node:sqlite` (Node ≥ 22.5), Drizzle, Turso, or similar. |
| **`astro:transitions` API removals** | `TRANSITION_BEFORE_PREPARATION` and friends, `isTransitionBeforeSwapEvent()`, `createAnimationScope()` are gone. Use the lifecycle event names directly (`'astro:before-preparation'`). Note: a repo-wide grep for `transition:` will mostly hit **CSS** `transition:` properties — filter before panicking. |
| **`session: false`** (7.2) | New opt-out that strips the session runtime from SSR bundles. Only relevant to SSR sites. |
| **Incremental builds** (7.2, experimental) | `experimental.incrementalBuild: true` plus a `cacheKey` from `getStaticPaths()`. Opt-in; routes without a `cacheKey` always re-render. Not worth it for small static sites. |

### Quick audit script

Run this on any Astro 6 repo to see which traps apply:

```bash
#!/usr/bin/env bash
# astro7-audit.sh - run from an Astro repo root. Reports which traps apply.
cfg=$(ls astro.config.* 2>/dev/null | head -1)

# Report matches, or "clear". Note: piping grep into sed would ALWAYS look
# clear, because a pipeline's exit status is sed's, not grep's.
report() {  # report <matches>
  if [ -n "$1" ]; then printf '%s\n' "$1" | sed 's/^/  ACTION: /'; else echo "  clear"; fi
}

echo "--- Trap 1: markdown plugins ---"
if grep -q "remarkPlugins\|rehypePlugins\|remarkRehype" "$cfg" 2>/dev/null; then
  if grep -q "processor:\s*unified(\|from ['\"]@astrojs/markdown-remark" "$cfg"; then
    echo "  plugins present AND already wrapped in unified() -> migrated"
  else
    echo "  ACTION: plugins at top level of markdown{} -> move into processor: unified({...})"
    grep -n "remarkPlugins\|rehypePlugins\|remarkRehype" "$cfg" | sed 's/^/    /'
  fi
else
  echo "  no remark/rehype plugins -> nothing to do"
fi

echo "--- Trap 2: compressHTML ---"
grep -q "compressHTML" "$cfg" 2>/dev/null \
  && grep -n "compressHTML" "$cfg" | sed 's/^/  /' \
  || echo "  ACTION: not set -> v7 default changes to 'jsx' and will join words"

echo "--- Trap 3: CSP inline-script hashes ---"
n=$(grep -ho "sha256-[A-Za-z0-9+/=]*" netlify.toml public/_headers 2>/dev/null | sort -u | wc -l | tr -d ' ')
[ "$n" -gt 0 ] \
  && echo "  ACTION: $n pinned hash(es) -> regenerate after upgrading" \
  || echo "  no pinned hashes"

echo "--- experimental flags (delete the graduated ones) ---"
report "$(grep -n -A10 'experimental' "$cfg" 2>/dev/null)"

echo "--- reserved filename src/fetch.* ---"
report "$(find src -maxdepth 1 -name 'fetch.*' 2>/dev/null)"

echo "--- astro:transitions removed APIs (CSS 'transition:' is NOT a match) ---"
report "$(grep -rn 'TRANSITION_BEFORE\|TRANSITION_AFTER\|isTransitionBeforeSwapEvent\|createAnimationScope' src/ 2>/dev/null)"

echo "--- container renderer import path ---"
report "$(grep -rn 'getContainerRenderer' src/ 2>/dev/null)"

echo "--- @astrojs/db (removed in v7) ---"
report "$(grep -rn 'astro:db\|@astrojs/db' src/ package.json 2>/dev/null)"

echo "--- astro + integrations (check each against the version table) ---"
node -e 'const p=require("./package.json");const d={...p.dependencies,...p.devDependencies};
Object.entries(d).filter(([k])=>k==="astro"||k.startsWith("@astrojs/")||k.startsWith("astro-"))
  .forEach(([k,v])=>console.log("  "+k+" "+v))' 2>/dev/null
```

Two notes on that script, learned the hard way:

- A bare `grep rehypePlugins` **false-positives on an already-migrated config**,
  because the plugins legitimately still appear inside `unified({...})`. Check
  for the `unified(` wrapper before reporting.
- Grepping `transition:` to find `astro:transitions` usage is useless — it
  matches every CSS `transition:` property in the codebase. Match the removed
  API names instead.

---

## Ecosystem versions

Checked 2026-08-10. Integrations declaring `peer astro: ^7.0.0` need a major
bump alongside Astro:

| Package | Latest | Astro peer |
|---|---|---|
| `@astrojs/markdown-remark` | 7.2.2 | pinned exactly by `astro@7.2.0` |
| `@astrojs/mdx` | 7.0.5 | `^7.0.0` |
| `@astrojs/vue` | 7.0.2 | `^7.0.0` |
| `@astrojs/svelte` | 9.0.1 | `^7.0.0` |
| `@astrojs/netlify` | 8.2.0 | `^7.0.0` |
| `@astrojs/vercel` | 11.0.5 | `^7.0.0` |
| `@astrojs/node` | 11.1.0 | `^7.0.0` |
| `@astrojs/react` | 6.0.2 | none declared |
| `@astrojs/sitemap` | 3.7.3 | none declared — 3.x works as-is |
| `@astrojs/rss` | 4.0.19 | none declared |
| `@astrojs/partytown` | 2.1.7 | none declared |

**Third-party integrations are the risk.** `astro-seo@1.1.0` (used across the
portfolio) declares `peerDependencies: { astro: "^5.16.0" }` and has not been
updated. It builds and renders correctly under 7.2.0, but the peer range has
been stale since Astro 6 — expect a peer warning, not a failure. Verify its
output rather than trusting the range.

---

## The verification method that actually works

Both serious traps produce a **green build and a plausible-looking page**. The
only reliable check is to diff *rendered output* against a pre-upgrade
baseline. Note that both a byte-diff of the HTML and a naive text extraction
will drown you in false positives — the compiler legitimately reshuffles
whitespace between block elements. Compare what a browser actually renders.

**1. Baseline before touching anything**

```bash
pnpm build && cp -R dist /tmp/baseline-v6
```

**2. Serve both builds from one origin** so iframes stay same-origin:

```bash
mkdir -p /tmp/compare && cp -R /tmp/baseline-v6/dist /tmp/compare/v6 && cp -R dist /tmp/compare/v7
cd /tmp/compare && python3 -m http.server 4399
```

**3. Compare rendered `innerText` per page** — catches Trap 2. Run in the
browser console at that origin:

```js
const pages = ["index","about","research","sites"];   // your routes
const load = (u) => new Promise(res => {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;left:-99999px;width:1280px;height:900px';
  f.src = u;
  f.onload = () => setTimeout(() => { const t = f.contentDocument.body.innerText; f.remove(); res(t); }, 250);
  document.body.appendChild(f);
});
for (const p of pages) {
  const [a, b] = [await load(`/v6/${p}.html`), await load(`/v7/${p}.html`)];
  console.log(a === b ? `identical  ${p}` : `DIFFERS    ${p}`);
}
```

**4. Compare DOM structure + attributes** — catches Trap 1. `innerText` cannot
see attributes, and `rehype-external-links` works purely through them:

```js
const links = [...d.querySelectorAll('a')]
  .map(a => `${a.getAttribute('href')} target=${a.getAttribute('target')} rel=${a.getAttribute('rel')}`);
// compare the v6 and v7 arrays; also compare per-page counts of target=_blank
```

On SFS this produced the decisive evidence: 10/11 pages structurally identical
including every `target`/`rel` pair, with the only delta being the search
bundle's content hash (Vite 8's minifier, same fuse.js source, 674 bytes
smaller). Keep a known-good signal in mind — external-link counts per page
(6, 7, 8, 11, 15, 17) matching exactly is what proves the rehype plugin is
still running.

**5. Then the usual gates:** `axe-core` AA, Lighthouse a11y, internal link
check, and a CSP-enforced browser pass (Trap 3).

---

## `dev-server.sh` — adopt it on Astro 6 first

`docs/astro-conversion-checklist-v6.4.md` §19 established a canonical
`start-dev-server` at the repo root. Astro 7 breaks its central assumption:
that script ends in `exec pnpm dev`, which no longer describes anything real
once the dev server daemonizes.

**The recommendation: replace it with `dev-server.sh` on your Astro 6 sites
now, before you upgrade.** The script detects which major it is running under
and adapts, so the commands your team types never change:

```bash
./dev-server.sh            # status - what's running, and what to type next
./dev-server.sh start      # start detached
./dev-server.sh stop       # stop it AND free the port
./dev-server.sh restart
./dev-server.sh logs -f
```

### Why it earns its place on Astro 6, before any upgrade

1. **It backports the good part of Astro 7.** On Astro 6 it detaches the server
   itself (`nohup` + `disown`) and gives you `stop` / `status` / `logs`. You get
   the ergonomics of the v7 supervisor a major version early.
2. **It absorbs the Trap 4 breaking change.** When you do upgrade, the daemon
   behaviour changes underneath the script, not underneath your team. Nobody
   has to learn `astro dev stop`.
3. **It fixes the orphan problem that already exists on 6.** `stop` sweeps the
   port (SIGTERM → SIGKILL) *in addition to* asking Astro nicely, so a stray
   `pnpm dev` or a leftover `astro preview` gets cleaned up. Astro's own
   supervisor only knows about servers it started — it is blind to those.
4. **It carries the v6.4 checklist's hard-won `--port` fix forward.** Flags are
   stripped from the passthrough list and `--port "$PORT"` is supplied exactly
   once, so you never get `astro dev --port 4321 --port 5000` (which Astro
   resolves by silently falling back to its default port — §19's original bug).

### How the detection works

Feature-detect the CLI rather than parsing a version string, so it keeps
working through backports and pre-releases:

```bash
if pnpm exec astro dev --help 2>/dev/null | grep -q -- "--background"; then
  SUPERVISED="yes"   # Astro 7+: astro dev --background / stop / status / logs
else
  SUPERVISED="no"    # Astro 6:  nohup + disown, port is the source of truth
fi
```

Verified on both: an Astro 6.4.6 checkout and Astro 7.2.0 produce identical
command output and lifecycle, including custom `--port`.

### Design note: status, not toggle

The bare command reports status; it does not toggle. A toggle does the wrong
thing precisely when you have lost track of the state, and running it twice
silently undoes itself. Status answers the actual question — *"is it up?"* —
and prints the next command to type.

Full script: [`dev-server.sh`](../dev-server.sh) at the repo root.

---

## Is it faster? Measured numbers

Measured on this repo (11 pages, ~6 MB dist), Apple Silicon, median of 5 warm
and 3 cold runs, v6 and v7 interleaved to spread machine-load drift:

| | Astro 6.4.6 | Astro 7.2.0 | |
|---|---|---|---|
| Warm rebuild, wall clock | 1973 ms | 1294 ms | **−34%** |
| Warm, Astro page-build phase | 1210 ms | 595 ms | **−51%** |
| Cold build, wall clock | 3246 ms | 2396 ms | **−26%** |
| Cold, Astro page-build phase | 2470 ms | 1650 ms | **−33%** |
| Dev cold start → first render | 1573 ms | 1749 ms | **+11% slower** |

**Honest summary:** the Rust compiler roughly halves Astro's own page-rendering
phase, which is a real and welcome build win. But dev cold start *regressed*,
and output size is a wash — HTML +836 B across 11 pages, JS −674 B. There is no
runtime or Core Web Vitals gain. This is a build-time story only; do not sell
it to stakeholders as a site-speed improvement.

> Benchmark honestly: use `git worktree add ../bench-v6 <pre-upgrade-sha>` to
> get a real isolated v6 install, interleave the runs, and report the median.
> And remember Trap 4 — if your harness kills the dev server by process group,
> Astro 7 ignores it and your numbers are meaningless.

---

## Order of operations

1. **Audit first.** Run the quick audit script above on the Astro 6 repo.
2. **Adopt `dev-server.sh`** while still on Astro 6 (separate, low-risk commit).
3. **Branch** — `chore/astro-7`. Major bumps get their own PR, per checklist §"Stay current".
4. **Baseline** — `pnpm build && cp -R dist /tmp/baseline-v6`.
5. **Upgrade** — `pnpm add astro@7` plus `@astrojs/markdown-remark@7.2.2` if you
   use plugins; bump any integration whose peer is `^7.0.0`.
6. **Config** — migrate `markdown.*Plugins` → `processor: unified({...})`; add
   `compressHTML: true`; delete graduated `experimental` flags.
7. **Build and fix** — unclosed tags will now error.
8. **Diff rendered output** against the baseline: `innerText` *and* DOM
   attributes. Do not skip this; it is the only thing that catches Traps 1 & 2.
9. **Regenerate CSP hashes** into `netlify.toml` (all three blocks) *and*
   `public/_headers`; verify under an enforced CSP in a browser.
10. **Re-run the audits** — axe, Lighthouse, link check.
11. **Update docs** — README badges/stack lines, `package.json` description,
    CHANGELOG.

---

## Links

- [Astro v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/) — canonical breaking-change list
- [Astro 7.2 release post](https://astro.build/blog/astro-720/) — incremental builds, `session: false`, `preview --background`
- [Markdown content guide](https://docs.astro.build/en/guides/markdown-content/) — Sätteri vs unified
- [Configuration reference — markdown options](https://docs.astro.build/en/reference/configuration-reference/#markdown-options)
- [Syntax highlighting guide](https://docs.astro.build/en/guides/syntax-highlighting/) — `syntaxHighlight` / `shikiConfig` stay top-level
- [MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) — separate `processor`; no Recma under Sätteri
- [CLI reference — `astro dev`](https://docs.astro.build/en/reference/cli-reference/#astro-dev) — `stop` / `status` / `logs` / `--background`
- [Vite 8 migration guide](https://vite.dev/guide/migration)
- `astro-conversion-checklist-v6.4.md` — sibling doc; Vue/Nuxt → Astro conversion, CSP hash rule (§ Phase 7), `start-dev-server` history (§19)

---

## Changelog for this document

- **2026-08-10** — written from the SFS 6.4.6 → 7.2.0 upgrade. Next site to
  migrate: update this file with anything that generalizes, especially
  MDX-heavy or SSR/adapter-based sites, which SFS (static, no MDX, no adapter)
  could not exercise.
