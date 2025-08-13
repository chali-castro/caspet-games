<script setup lang="ts">
import { onMounted, ref } from 'vue';

const adsbygoogle = ref();

onMounted(() =>
{
    (adsbygoogle.value = adsbygoogle.value || []).push({});
});
</script>

<template>
    <ins ref="adsbygoogle"
        :data-ad-client="import.meta.env.VITE_ADSENSE_CLIENT"
        data-ad-slot="1234567890"></ins>
</template>