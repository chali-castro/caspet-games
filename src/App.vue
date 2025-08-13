<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import { adsenseClient } from './firebase';

onMounted(async () =>
{
  await nextTick();
  const window: any = document.defaultView;
  console.log(window.adsbygoogle, adsenseClient);
  console.log(window);
  window.adsbygoogle = (window.adsbygoogle || []).push({});
  console.log(window.adsbygoogle);
});
</script>
  
<template>
  <v-app>
    <v-layout>
      <router-view />
    </v-layout>
  </v-app>
   <ins class="adsbygoogle"
    :data-ad-client="adsenseClient"
    data-ad-slot="1234567890"
    data-ad-format="auto"></ins>
</template>
