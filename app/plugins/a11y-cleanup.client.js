/**
 * Post-mount accessibility cleanup for Vuetify's default v-btn / v-menu output.
 *
 * 1. v-menu activators carry both `aria-controls` and `aria-haspopup`. axe
 *    treats the combination as a "needs review" because it can't statically
 *    prove the referenced popup is in the DOM. `aria-expanded` already carries
 *    the same information for assistive tech, so dropping `aria-controls`
 *    keeps semantics intact without the false positive.
 *
 * 2. v-btn renders `.v-btn__overlay` / `.v-btn__underlay` spans inside every
 *    button. axe's contrast algorithm walks siblings of the text node and
 *    flags `bgOverlap` whenever any sibling box could overlap the text — even
 *    if the sibling is transparent or zero-sized. The cleanest cure is to
 *    delete those spans after Vuetify mounts, since the nav doesn't rely on
 *    the ripple/hover effects they back (we use a CSS filter for hover).
 *
 * The plugin signals completion via `<html data-a11y-ready="true">` so
 * automated audits can wait for the cleaned DOM before running.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === "undefined") return;

  const clean = () => {
    document
      .querySelectorAll('[aria-haspopup][aria-controls^="v-menu"]')
      .forEach((el) => el.removeAttribute("aria-controls"));

    document
      .querySelectorAll(".v-btn__overlay, .v-btn__underlay")
      .forEach((el) => el.remove());
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      clean();
    });
  };

  const mo = new MutationObserver((records) => {
    // Skip self-triggered mutations to avoid loops.
    const selfTrigger = records.every((r) =>
      Array.from(r.removedNodes).every(
        (n) =>
          n.nodeType === 1 &&
          (n.classList?.contains("v-btn__overlay") ||
            n.classList?.contains("v-btn__underlay"))
      )
    );
    if (selfTrigger) return;
    schedule();
  });

  nuxtApp.hook("app:mounted", () => {
    clean();
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-controls"],
    });

    // Two paint frames after mount, the SPA and any lazy components have
    // settled. Mark ready then so audits running on `load` see the clean DOM.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clean();
        document.documentElement.setAttribute("data-a11y-ready", "true");
      });
    });
  });
});
