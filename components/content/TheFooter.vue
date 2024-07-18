<template>
  <div>
    <the-context-footer></the-context-footer>
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

              <div class="pb-6" style="margin-top: -10px">
                <v-btn
                  variant="text"
                  style="
                    color: #fff !important;
                    font-size: 20px;
                    margin-right: -10px;
                  "
                  target="_blank"
                  aria-label="Link to ICJIA on Facebook"
                  href="https://www.facebook.com/ICJIA/"
                  class="footer-link"
                  ><v-icon>mdi-facebook</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  aria-label="Link to ICJIA on YouTube"
                  class="footer-link"
                  href="https://www.youtube.com/c/illinoiscriminaljusticeinformationauthority"
                  ><v-icon> mdi-youtube</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.instagram.com/icjia_illinois/"
                  class="footer-link"
                  aria-label="ICJIA on Instagram"
                  ><v-icon>mdi-instagram</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.linkedin.com/company/icjia/"
                  aria-label="ICJIA on LinkedIn "
                  class="footer-link"
                  ><v-icon>mdi-linkedin</v-icon></v-btn
                >
              </div>

              <div style="font-size: 12px; font-weight: 400">
                <strong
                  >&#169; 2024
                  <a
                    href="https://icjia.illinois.gov"
                    target="_blank"
                    style="color: #fff"
                    >Illinois Criminal Justice Information Authority</a
                  >
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <nuxt-link to="/privacy" style="color: #fff"
                    >Privacy
                  </nuxt-link>
                </strong>
                &nbsp;|&nbsp;
                <nuxt-link to="/contact" style="color: #fff; background: none"
                  >Contact</nuxt-link
                >&nbsp;
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
    const { isTranslationEnabled } = useAppConfig();
    const scrollTop = () => {
      window.scrollTo(0, 0);
    };

    const translate = () => {
      const toggleState = useTranslateToggle();
      toggleState.value = true;
    };

    const routeToSite = () => {
      // open new site in new tab
      window.open("https://icjia.illinois.gov", "_blank");
    };
    return { routeToSite, scrollTop, translate, isTranslationEnabled };
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
</style>
