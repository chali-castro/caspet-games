<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import useGames from '../composables/useGames';

const { gmRoom } = useGames();
const roomMain = ref<HTMLDivElement | null>(null);

watch(() => gmRoom.value, async () =>
{
    await nextTick();
    if (roomMain.value) {
        const div = roomMain.value;
        div.scrollTo({ top: div.scrollHeight });
    }
}, { immediate: true });
</script>
<template>
    <v-app-bar color="primary">
        <v-app-bar-title>Game Master View - Juego: {{ gmRoom!.gameName }} - Mensajes privados</v-app-bar-title>
        <v-label>Participantes: {{ gmRoom!.listaParticipantes }}</v-label>
    </v-app-bar>
    <v-main style="height: 100vh;">
        <div class="overflow-y-auto"
            style="height: 100%;"
            ref="roomMain">
            <v-row>
                <v-col>
                    <v-list>
                        <v-list-item v-for="msg in gmRoom!.publicos"
                            :key="msg.mensaje">
                            <div class="d-flex flex-row">
                                <div class="pa-1 player">{{ msg.sender }}:</div>
                                <div class="pa-1">{{ msg.mensaje }}</div>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>