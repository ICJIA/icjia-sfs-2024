<!--
/**
 * TheFooter - Main footer component for the application.
 *
 * This component displays the site footer with:
 * - TheContextFooter navigation bar
 * - ICJIA logo (clickable to navigate to main ICJIA site)
 * - Social media links (Facebook, YouTube, Instagram, LinkedIn)
 * - Copyright and contact information
 * - Privacy and Accessibility report links
 * - Additional footer navigation links
 *
 * The footer uses a dark blue background (#0d4474) and includes
 * comprehensive accessibility features with ARIA labels and screen reader text.
 *
 * @component
 * @example
 * <TheFooter />
 */
-->
<template>
  <div>
    <!-- Contextual navigation footer (blue bar with links) -->
    <the-context-footer></the-context-footer>

    <!-- Main footer section -->
    <v-footer dark class="" style="margin: 0; padding: 0">
      <v-card
        flat
        tile
        width="100%"
        class="text-center markdown-body pb-4"
        style="background: #0d4474"
      >
        <v-container fill-height>
          <v-row align="center" justify="center">
            <v-col
              cols="12"
              md="12"
              class="text-center mt-0"
              style="color: white"
            >
              <!--
                ICJIA logo - clickable to navigate to main ICJIA website.
                Uses programmatic navigation via routeToSite() function.
              -->
              <div>
                <img
                  src="/icjia-logo.png"
                  alt="Footer logo"
                  width="150"
                  style="border: 0px solid #ddd; display: inline"
                  class="hover"
                  @click="routeToSite()"
                />
              </div>

              <!--
                Social media links section.
                Each link opens in a new window with proper ARIA labels
                and screen reader text for accessibility.
              -->
              <div class="pb-6" style="margin-top: -10px">
                <!-- Facebook link -->
                <v-btn
                  variant="text"
                  style="
                    color: #fff !important;
                    font-size: 20px;
                    margin-right: -10px;
                  "
                  target="_blank"
                  aria-label="Link to ICJIA on Facebook (opens in new window)"
                  href="https://www.facebook.com/ICJIA/"
                  class="footer-link"
                  ><v-icon>mdi-facebook</v-icon
                  ><span class="sr-only"> (external link)</span></v-btn
                >

                <!-- YouTube link -->
                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  aria-label="Link to ICJIA on YouTube (opens in new window)"
                  class="footer-link"
                  href="https://www.youtube.com/c/illinoiscriminaljusticeinformationauthority"
                  ><v-icon> mdi-youtube</v-icon
                  ><span class="sr-only"> (external link)</span></v-btn
                >

                <!-- Instagram link -->
                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.instagram.com/icjia_illinois/"
                  class="footer-link"
                  aria-label="ICJIA on Instagram (opens in new window)"
                  ><v-icon>mdi-instagram</v-icon
                  ><span class="sr-only"> (external link)</span></v-btn
                >

                <!-- LinkedIn link -->
                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.linkedin.com/company/icjia/"
                  aria-label="ICJIA on LinkedIn (opens in new window)"
                  class="footer-link"
                  ><v-icon>mdi-linkedin</v-icon
                  ><span class="sr-only"> (external link)</span></v-btn
                >
              </div>

              <!--
                Copyright and footer links section.
                Includes copyright notice, link to main ICJIA site, and privacy policy.
              -->
              <div style="font-size: 12px; font-weight: 400">
                <strong
                  >&#169; {{ currentYear }}
                  <a
                    href="https://icjia.illinois.gov"
                    target="_blank"
                    style="color: #fff"
                    aria-label="Illinois Criminal Justice Information Authority (opens in new window)"
                    >Illinois Criminal Justice Information Authority<span
                      class="sr-only"
                    >
                      (external link)</span
                    ></a
                  >
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <nuxt-link to="/privacy" style="color: #fff"
                    >Privacy
                  </nuxt-link>
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <a
                    href="/docs/index.html"
                    style="color: #fff"
                    aria-label="Documentation Portal"
                    >Documentation
                  </a>
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <a
                    href="/docs/accessibility/index.html"
                    style="color: #fff"
                    aria-label="Accessibility Audit Report"
                    >Accessibility
                  </a>
                </strong>

                <!-- Contact link - currently disabled -->
                <!-- &nbsp;|&nbsp; -->
                <!-- <nuxt-link to="/contact" style="color: #fff; background: none"
                  >Contact</nuxt-link
                > -->

                &nbsp;
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-footer>
  </div>
</template>

<script>
export default {
  setup() {
    // Get translation feature flag from app configuration
    const { isTranslationEnabled } = useAppConfig();

    /**
     * Get the current year for the copyright notice.
     * Automatically updates each year without code changes.
     *
     * @returns {number} The current year
     */
    const currentYear = computed(() => new Date().getFullYear());

    /**
     * Scrolls the page to the top.
     * Currently defined but not actively used in the template.
     *
     * @returns {void}
     */
    const scrollTop = () => {
      window.scrollTo(0, 0);
    };

    /**
     * Opens the translation modal.
     * Used when translation features are enabled.
     *
     * @returns {void}
     */
    const translate = () => {
      const toggleState = useTranslateToggle();
      toggleState.value = true;
    };

    /**
     * Opens the main ICJIA website in a new tab.
     * Triggered when the user clicks the ICJIA logo in the footer.
     *
     * @returns {void}
     */
    const routeToSite = () => {
      // Open main ICJIA site in new tab
      window.open("https://icjia.illinois.gov", "_blank");
    };

    return {
      routeToSite,
      scrollTop,
      translate,
      isTranslationEnabled,
      currentYear,
    };
  },
};
</script>

<style lang="scss" scoped>
.goToTop {
  margin: 0;
  font-size: 10px;
  color: #fff;
  text-decoration: none;
  background: none;
  cursor: pointer;
}

.goToTop:hover {
  text-decoration: underline;
  color: #aaa;
}

.footer-link {
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Screen reader only text for accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
