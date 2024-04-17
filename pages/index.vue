<template>
  <div>
    <v-img
      class="bg-grey-lighten-2"
      src="/splash-01.jpg"
      width="100%"
      height="800"
      cover
      style="margin-top: -65px; filter: grayscale(50%)"
      gradient="to bottom, rgba(0,0,0,.3), rgba(0,0,0,0)"
    ></v-img>
  </div>
</template>

<script setup>
let isCopied = ref(false);

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
