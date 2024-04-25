<template>
  <div>
    <v-toolbar dense floating style="z-index: 999" color="transparent">
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          color="white"
          style="font-size: 20px"
        ></v-app-bar-nav-icon>
      </template>

      <v-toolbar-title style="font-weight: 900; color: #fff; font-size: 24px"
        >SFS | Safe From the Start</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn color="white" size="large" to="/about">About Us</v-btn>
      <v-btn color="white" size="large">Link 2</v-btn>
      <v-btn color="white" size="large">Link 3</v-btn>
      <v-btn color="white" size="large">Link 4</v-btn>
      <v-btn icon color="white" style="font-size: 20px">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon color="white" style="font-size: 20px">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
