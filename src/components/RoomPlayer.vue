<script setup lang="ts">
import useGames from '../composables/useGames';
import Mensaje from './Mensaje.vue';

const { playerRoom, showMensajesDialog } = useGames();

</script>
<template>
    <mensaje/>
    <v-container>
        <v-row>
            <v-col>
                <h2>Player View</h2>
                <p>Room ID: {{ playerRoom!.id }}</p>
                <p>Nombre del juego: {{ playerRoom!.gameName }}</p>
                <p>Participantes: {{ playerRoom!.listaParticipantes }}</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>Mensajes Privados</h3>
                <v-list>
                    <v-list-item v-for="msg in playerRoom!.privados" :key="msg.mensaje">
                        <div class="d-flex flex-row">
                            <div class="ma-3 pa-3 player">{{ msg.sender }}:</div>
                            <div class="ma-3 pa-3">{{ msg.mensaje }}</div>
                        </div>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="showMensajesDialog = {show: true, tipo: 'privado'}">Enviar Mensaje Privado</v-btn>
                <v-spacer/>
                <v-btn @click="showMensajesDialog = {show: true, tipo: 'publico'}">Enviar Mensaje Público</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>