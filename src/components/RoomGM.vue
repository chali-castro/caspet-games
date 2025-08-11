<script setup lang="ts">
import useGames from '../composables/useGames';

const { gmRoom } = useGames();

</script>
<template>
    <v-container>
        <v-row>
            <v-col>
                <h2>Game Master View</h2>
                <p>Room ID: {{ gmRoom!.id }}</p>
                <p>Nombre del juego: {{ gmRoom!.gameName }}</p>
                <p>Participantes: {{ gmRoom!.listaParticipantes }}</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>Mensajes Públicos</h3>
                <v-list>
                    <v-list-item v-for="msg in gmRoom!.publicos" :key="msg.mensaje">
                        <div style="color: darkturquoise;">{{ msg.sender }}:</div>
                        <div>{{ msg.mensaje }}</div>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
</template>