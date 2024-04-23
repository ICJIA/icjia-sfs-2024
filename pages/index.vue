<template>
  <div>
    <HomeSplash></HomeSplash>

    <v-container style="margin-top: 65px; margin-bottom: 75px"
      ><v-row
        ><v-col cols="12" class="text-center"
          ><h1>Regia sanguine et credere</h1>
          <div style="font-size: 18px" class="mt-6">
            Lorem markdownum horum claro tenuit, a etiam cupidine timentem declinat, quies
            morbo? Granico fatus, viridi quoniam patriam cognoscere comitata numine
            vocalia. Nondum misit regia sanguine et credere coniunx. Loca viridi: agit
            citharaque vultu ut tellus orbae referre referunt equos et parens, iuvencae
            credere cui.
          </div>

          <div></div></v-col></v-row
    ></v-container>

    <div
      style="background: #f5f5f5; min-height: 200px; border-top: 1px #ddd solid"
      class="py-8"
    >
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h2>Tectaphon de est sed cognataque</h2>
            <p>
              Iam nati, ab servat barbarica dapes mihi circuiere poterit ulvae, hinc
              cornua, antri omen lacrimas qui laborum. Talis qui procul protegat Maenalon
              pictas caelestia mora; donis Tectaphon de est sed cognataque pacali negata
              rebelles. Inmane est nataque, nec navigiis o expulsa violenta merui
              spectentque periuria pennis illis Aeacidis vulnus. Et profuga tacitos
              antiquas hiatu: undis aevo dies hinc, ictus prohibetque quoque fati. Ut
              inspirat per vestigia tremendos clauserat.
            </p>
            <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down"
            ><v-img src="https://placehold.co/600x400"></v-img
          ></v-col> </v-row
      ></v-container>

      <v-container style="margin-top: 100px"
        ><v-row>
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down"
            ><v-img src="https://placehold.co/600x400"></v-img></v-col
          ><v-col cols="12" md="6"
            ><h2>Inspirat per vestigia tremendos</h2>
            <p>
              Iam nati, ab servat barbarica dapes mihi circuiere poterit ulvae, hinc
              cornua, antri omen lacrimas qui laborum. Talis qui procul protegat Maenalon
              pictas caelestia mora; donis Tectaphon de est sed cognataque pacali negata
              rebelles. Inmane est nataque, nec navigiis o expulsa violenta merui
              spectentque periuria pennis illis Aeacidis vulnus. Et profuga tacitos
              antiquas hiatu: undis aevo dies hinc, ictus prohibetque quoque fati. Ut
              inspirat per vestigia tremendos clauserat.
            </p>
            <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Find Out How</v-btn>
            </div>
          </v-col>
        </v-row></v-container
      >
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h2>Inmane est nataquee</h2>
            <p>
              Iam nati, ab servat barbarica dapes mihi circuiere poterit ulvae, hinc
              cornua, antri omen lacrimas qui laborum. Talis qui procul protegat Maenalon
              pictas caelestia mora; donis Tectaphon de est sed cognataque pacali negata
              rebelles. Inmane est nataque, nec navigiis o expulsa violenta merui
              spectentque periuria pennis illis Aeacidis vulnus.
            </p>
            <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down"
            ><v-img src="https://placehold.co/600x400"></v-img
          ></v-col> </v-row
      ></v-container>

      <v-container style="margin-top: 100px; margin-bottom: 100px"
        ><v-row>
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down"
            ><v-img src="https://placehold.co/600x400"></v-img></v-col
          ><v-col cols="12" md="6"
            ><h2>Inspirat per vestigia tremendos</h2>
            <p>
              Iam nati, ab servat barbarica dapes mihi circuiere poterit ulvae, hinc
              cornua, antri omen lacrimas qui laborum. Talis qui procul protegat Maenalon
              pictas caelestia mora; donis Tectaphon de est sed cognataque pacali negata
              rebelles. Inmane est nataque, nec navigiis o expulsa violenta merui
              spectentque periuria pennis illis Aeacidis vulnus. Et profuga tacitos
              antiquas hiatu: undis aevo dies hinc, ictus prohibetque quoque fati. Ut
              inspirat per vestigia tremendos clauserat.
            </p>
            <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Contact Us</v-btn>
            </div>
          </v-col>
        </v-row></v-container
      >
    </div>
    <div>
      <HomeSplashSecondary class="mt-16"></HomeSplashSecondary>
      <div
        style="height: 500px; background: #fafafa; font-weight: 900"
        class="text-center pt-10"
      >
        Contact form here
      </div>
      <div
        style="height: 200px; background: #ccc; font-weight: 900"
        class="text-center pt-10"
      >
        Footer here
      </div>
    </div>
  </div>
</template>

<script setup>
let isMounted = ref(false);

onMounted(async () => {
  isMounted.value = true;
});
</script>
