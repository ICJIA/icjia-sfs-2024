<template>
  <div>
    <v-container class="mt-12"
      ><v-row fill-height><v-col> Content here </v-col></v-row></v-container
    >
  </div>
</template>

<script setup>
let isCopied = ref(false);
let link = ref(
  "https://researchhub.icjia-api.cloud/uploads/housing options for probationers FINAL PDF-231024T20415515.pdf"
);

const encode = () => {
  link.value = encodeURI(link.value);
};
const decode = () => {
  link.value = decodeURI(link.value);
};

const gotoURL = () => {
  window.open(link.value, "_blank");
};

const copyToClipboard = () => {
  isCopied.value = true;
  navigator.clipboard.writeText(link.value);
};

const clearMessages = () => {
  isCopied.value = false;
  // link.value = "";
};

const clearAll = () => {
  isCopied.value = false;
  link.value = "";
};
</script>

<style lang="scss" scoped></style>
