<script setup lang="ts">
import { auth } from '../firebase';
import useGames from '../composables/useGames';
import NewRoom from './NewRoom.vue';

const { empezarJuego, rooms, showNewRoomDialog } = useGames();

const logout = async () =>
{
  await auth.signOut();
};

</script>

<template>
  <new-room />
  <v-app-bar color="primary">
    <v-app-bar-title>Rooms</v-app-bar-title>
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
  </v-app-bar>
  <v-main class="d-flex align-center justify-center">
    <v-container>
      <v-item-group>
        <v-row>
          <v-col v-for="item in rooms"
            :key="item.id">
            <v-item v-slot>
              <v-card width="300">
                <v-card-title>{{ item.name }}</v-card-title>
                <v-text-field
                  v-model="item.tipo"
                  label="Tipo de juego"
                  disabled />
                <v-text-field
                  v-model="item.listaParticipantes"
                  label="Participantes"
                  disabled />

                <v-card-actions>
                  <v-btn color="primary"
                    @click="empezarJuego(item)">
                    Empezar
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
