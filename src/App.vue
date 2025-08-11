<script setup lang="ts">
import useGames from './composables/useGames';
import Login from './components/Login.vue';
import Rooms from './components/Rooms.vue';
import RoomGM from './components/RoomGM.vue';
import RoomPlayer from './components/RoomPlayer.vue';

const { gmRoom, playerRoom, usuario } = useGames();

</script>

<template>
  <v-layout>
    <Login v-if="!usuario" />
    <Rooms v-else-if="gmRoom === null && playerRoom === null" />
    <RoomGM v-else-if="gmRoom !== null" />
    <RoomPlayer v-else />
  </v-layout>
</template>
