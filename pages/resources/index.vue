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
      </v-row></v-container
    >

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-0">
          <ContentDoc
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: 'Lato', sans-serif"
          >
            <template #empty>Document not found</template>
            <template #not-found>Document not found</template>
          </ContentDoc>
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);

const { data } = await useAsyncData(`content-resources`, async () => {
  const post = await queryContent().where({ _path: "/resources" }).findOne();
  return post;
});

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
