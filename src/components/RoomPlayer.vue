<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import useGames from '../composables/useGames';
import Mensaje from './Mensaje.vue';

const { playerRoom, showMensajesDialog } = useGames();
const roomMain = ref<HTMLDivElement | null>(null);

watch(() => playerRoom.value, async () =>
{
    await nextTick();
    if (roomMain.value) {
        const div = roomMain.value;
        div.scrollTo({ top: div.scrollHeight });
    }
}, { immediate: true });

</script>
<template>
    <mensaje />
    <v-app-bar color="primary">
        <v-app-bar-title>Player View - Juego: {{ playerRoom!.gameName }} - Tus mensajes privados</v-app-bar-title>
        <v-label>Participantes: {{ playerRoom!.listaParticipantes }}</v-label>
    </v-app-bar>
    <v-main style="height: 100vh;">
        <div class="overflow-y-auto"
            style="height: 100%; background-color: antiquewhite;"
            ref="roomMain">
            <v-row>
                <v-col>
                    <v-list>
                        <v-list-item v-for="msg in playerRoom!.privados"
                            :key="msg.mensaje">
                            <div class="d-flex flex-row">
                                <div class="pa-1 player">{{ msg.sender }}:</div>
                                <div class="pa-1">{{ msg.mensaje }}</div>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex flex-row">
                    <v-btn class="mr-4"
                        @click="showMensajesDialog = { show: true, tipo: 'privado' }">Enviar Mensaje Privado</v-btn>
                    <v-btn class="mr-4"
                        @click="showMensajesDialog = { show: true, tipo: 'publico' }">Enviar Mensaje Público</v-btn>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>