<!--
/**
 * Sites Page - Directory of Safe From the Start program sites across Illinois.
 *
 * This page displays markdown content from /content/sites.md with:
 * - Dynamic page title from markdown frontmatter
 * - Hero image (hidden on mobile)
 * - Interactive map and list of SFS sites
 * - Contact information for each site
 *
 * The page includes special handling for the interactive map component
 * and uses Nuxt Content for flexible content management.
 *
 * @page
 * @route /sites
 */
-->
<template>
  <div class="pb-16">
    <v-container
      ><v-row
        ><v-col class="text-center mb-6">
          <h1
            style="font-size: 40px; margin-top: 80px; text-transform: uppercase"
          >
            {{ data?.title }}
          </h1></v-col
        >
        <v-img
          v-if="splashFull && splashThumbnail"
          :src="splashFull"
          :lazy-src="splashThumbnail"
          width="100%"
          height="700"
          cover
          style="filter: grayscale(60%); position: relative"
          class="hidden-sm-and-down"
        ></v-img></v-row
    ></v-container>

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-0">
          <ContentRenderer
            ref="contentDocRef"
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: &quot;Lato&quot;, sans-serif"
          />
          <!-- <div
            v-html="renderer.render(data.rawMarkdown)"
            class="markdown-body"
          ></div> -->
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/utils/thumbor.js";

let isMounted = ref(false);
let splashFull = ref(null);
let splashThumbnail = ref(null);
const contentDocRef = ref(null);

const { data } = await useAsyncData(`content-sites`, async () => {
  const post = await queryCollection("content").path("/sites").first();
  return post;
});

if (data && data.value.splash && data.value.splash[0]) {
  splashFull.value = getThumborUrl(data.value.splash[0]);
  splashThumbnail.value = getThumborUrl({
    url: data.value.splash[0].url,
    width: 150,
    height: 150,
    quality: 10,
  });
} else {
  splashFull.value = null;
  splashThumbnail.value = null;
}

// Function to add custom tooltips to agency name links
const addTooltipsToAgencyLinks = () => {
  nextTick(() => {
    // Find all links within the table that have target="_blank" and rel="noopener noreferrer"
    const agencyLinks = document.querySelectorAll(
      '.table-responsive a[target="_blank"][rel="noopener noreferrer"]'
    );

    agencyLinks.forEach((link) => {
      // Skip if tooltip is already added
      if (link.hasAttribute("data-tooltip-added")) {
        return;
      }

      const href = link.getAttribute("href");
      if (href) {
        // Add data attribute for CSS tooltip
        link.setAttribute("data-tooltip", href);

        // Add CSS class for tooltip styling
        link.classList.add("agency-link-tooltip");

        // Add mouse events for better positioning
        link.addEventListener("mouseenter", (e) => {
          const rect = e.target.getBoundingClientRect();
          const tooltip = e.target;

          // Ensure tooltip appears above table bounds
          tooltip.style.setProperty("--tooltip-top", `${rect.top - 10}px`);
          tooltip.style.setProperty(
            "--tooltip-left",
            `${rect.left + rect.width / 2}px`
          );
        });

        // Mark as processed
        link.setAttribute("data-tooltip-added", "true");
      }
    });
  });
};

onMounted(async () => {
  isMounted.value = true;

  // Add tooltips after content is mounted
  await nextTick();
  addTooltipsToAgencyLinks();

  // Also watch for content changes and re-add tooltips
  watch(
    () => data.value,
    () => {
      setTimeout(addTooltipsToAgencyLinks, 100);
    },
    { deep: true }
  );
});
</script>

<style lang="scss" scoped>
/* Ensure tooltips can escape table bounds while preserving responsive scrolling */
:deep(.table-responsive) {
  position: relative;
}

:deep(.table-responsive td) {
  position: relative;
}

/* Custom tooltip styles for agency links */
:deep(.agency-link-tooltip) {
  position: relative;
  cursor: pointer;
}

:deep(.agency-link-tooltip::before) {
  content: attr(data-tooltip);
  position: fixed;
  top: var(--tooltip-top, auto);
  left: var(--tooltip-left, 50%);
  transform: translateX(-50%) translateY(-100%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: normal;
  font-family: inherit;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s,
    visibility 0.3s;
  z-index: 99999;
  pointer-events: none;
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.agency-link-tooltip::after) {
  content: "";
  position: fixed;
  top: var(--tooltip-top, auto);
  left: var(--tooltip-left, 50%);
  transform: translateX(-50%) translateY(-100%) translateY(-5px);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s,
    visibility 0.3s;
  z-index: 99999;
}

:deep(.agency-link-tooltip:hover::before),
:deep(.agency-link-tooltip:hover::after) {
  opacity: 1;
  visibility: visible;
}

/* Mobile touch support */
:deep(.agency-link-tooltip:active::before),
:deep(.agency-link-tooltip:active::after) {
  opacity: 1;
  visibility: visible;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.agency-link-tooltip::before) {
    font-size: 12px;
    padding: 6px 10px;
    max-width: 250px;
    bottom: 130%;
  }

  :deep(.agency-link-tooltip::after) {
    bottom: 122%;
  }
}

@media (max-width: 480px) {
  :deep(.agency-link-tooltip::before) {
    font-size: 11px;
    padding: 5px 8px;
    max-width: 200px;
    left: 0;
    transform: none;
  }

  :deep(.agency-link-tooltip::after) {
    left: 20px;
    transform: none;
  }
}
</style>
