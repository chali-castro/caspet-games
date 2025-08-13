<script setup lang="ts">
import useGames from '../composables/useGames';
import NewRoom from './NewRoom.vue';
import Login from './Login.vue';
import router from '../router';
import { useFirebaseAuth } from 'vuefire';

const { empezarJuego, loggedIn, puedeAcceder, rooms, showNewRoomDialog } = useGames();
const auth = useFirebaseAuth();
const logout = async () =>
{
  await auth?.signOut();
};

</script>

<template>
  <new-room />
  <v-app-bar color="primary">
    <v-app-bar-title>Rooms</v-app-bar-title>
    <template v-if="loggedIn">
      <v-btn icon
        v-tooltip="'Crear Sala'"
        @click="showNewRoomDialog = true">
        <v-icon>mdi-fireplace-off</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn icon
        v-tooltip="'Cerrar Sesión'"
        @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </template>
    <template v-else>
    </template>
  </v-app-bar>
  <login v-if="!loggedIn" />
  <v-main v-else
    class="d-flex">
    <v-container>
      <v-item-group>
        <v-row>
          <v-col v-for="item in rooms"
            :key="item.id">
            <v-item v-slot>
              <v-card width="300">
                <v-card-title>{{ item.name }}</v-card-title>
                <v-text-field v-model="item.tipo"
                  label="Tipo de juego"
                  disabled />
                <v-text-field v-model="item.listaParticipantes"
                  label="Participantes"
                  disabled />
                <v-text-field v-model="item.gameName"
                  label="Nombre del juego"
                  disabled />
                <v-text-field v-model="item.status"
                  label="Estado"
                  disabled />

                <v-card-actions>
                  <v-btn v-if="item.status === 'create'"
                    color="primary"
                    @click="empezarJuego(item)">
                    Empezar
                  </v-btn>
                  <v-btn v-if="item.status === 'progress'"
                    color="primary"
                    @click="router.push({ name: 'RoomGM', params: { id: item.id } })">
                    GM
                  </v-btn>
                  <v-btn v-if="item.status === 'progress' && puedeAcceder(item)"
                    color="primary"
                    @click="router.push({ name: 'RoomPlayer', params: { id: item.id } })">
                    Jugador
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-item-group>
    </v-container>
  </v-main>
</template>
