<!--
/**
 * TheFooter - Main site footer.
 *
 * Contains the contextual nav bar, ICJIA branding, social links, and
 * copyright/privacy/doc links. All external links are real <a> elements with
 * rel="noopener noreferrer" so they're keyboard accessible and secure.
 *
 * @component
 */
-->
<template>
  <footer>
    <the-context-footer />

    <v-footer class="pa-0" role="contentinfo">
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
              <div>
                <a
                  href="https://icjia.illinois.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Illinois Criminal Justice Information Authority (opens in new window)"
                  class="hover footer-logo"
                >
                  <img
                    src="/icjia-logo.png"
                    alt=""
                    width="150"
                    height="105"
                    loading="lazy"
                    decoding="async"
                    style="border: 0px solid #ddd; display: inline"
                  />
                </a>
              </div>

              <nav aria-label="Social media" class="pb-6" style="margin-top: -10px">
                <v-btn
                  variant="text"
                  style="
                    color: #fff !important;
                    font-size: 20px;
                    margin-right: -10px;
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ICJIA on Facebook (opens in new window)"
                  href="https://www.facebook.com/ICJIA/"
                  class="footer-link"
                  ><v-icon aria-hidden="true">mdi-facebook</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ICJIA on YouTube (opens in new window)"
                  class="footer-link"
                  href="https://www.youtube.com/c/illinoiscriminaljusticeinformationauthority"
                  ><v-icon aria-hidden="true">mdi-youtube</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.instagram.com/icjia_illinois/"
                  class="footer-link"
                  aria-label="ICJIA on Instagram (opens in new window)"
                  ><v-icon aria-hidden="true">mdi-instagram</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/company/icjia/"
                  aria-label="ICJIA on LinkedIn (opens in new window)"
                  class="footer-link"
                  ><v-icon aria-hidden="true">mdi-linkedin</v-icon></v-btn
                >
              </nav>

              <div style="font-size: 12px; font-weight: 400">
                <strong
                  >&#169; {{ currentYear }}
                  <a
                    href="https://icjia.illinois.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color: #fff"
                    >Illinois Criminal Justice Information Authority<span
                      class="sr-only"
                    >
                      (opens in new window)</span
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
                  <a href="/docs/index.html" style="color: #fff"
                    >Documentation
                  </a>
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <a
                    href="/docs/accessibility/index.html"
                    style="color: #fff"
                    >Accessibility
                  </a>
                </strong>
                &nbsp;
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-footer>
  </footer>
</template>

<script setup>
const currentYear = computed(() => new Date().getFullYear());
</script>

<style lang="scss" scoped>
.footer-link {
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-logo {
  display: inline-block;
  line-height: 0;
}

.footer-logo:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 4px;
}
</style>
