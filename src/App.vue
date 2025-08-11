<script setup lang="ts">
import { ref } from 'vue';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import useGames from './composables/useGames';
import Login from './components/Login.vue';
import Rooms from './components/Rooms.vue';
import RoomGM from './components/RoomGM.vue';

const usuario = ref<User | null>(null);
const { currentGame } = useGames();

onAuthStateChanged(auth, (user) =>
{
  if (user) {
    usuario.value = user;
  } else {
    usuario.value = null;
  }
});

</script>

<template>
  <v-layout>
    <Login v-if="!usuario" />
    <Rooms v-else-if="currentGame === null" />
    <RoomGM v-else />
  </v-layout>
</template>
