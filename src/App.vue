<script setup lang="ts">
import { ref } from 'vue';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import Rooms from './components/Rooms.vue';
import Login from './components/Login.vue';

const usuario = ref<User | null>(null);

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
    <Rooms v-else />
  </v-layout>
</template>
