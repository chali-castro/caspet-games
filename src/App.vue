<script setup lang="ts">
import LoaderCircular from './components/LoaderCircular.vue';
</script>

<template>
  <loader-circular />
  <v-app>
    <v-layout>
      <router-view />
    </v-layout>
  </v-app>
</template>
