<script setup lang="ts">
import useGames from '../composables/useGames';

const { isLoading } = useGames();
</script>

<template>
    <v-dialog v-model="isLoading"
        fullscreen>
        <v-progress-circular indeterminate
            class="loader"
            :size="60"
            :width="5"
            color="#005EB5" />
    </v-dialog>
</template>

<style>
    .loader {
        margin: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>