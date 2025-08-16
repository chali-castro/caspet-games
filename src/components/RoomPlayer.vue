<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useGames from '../composables/useGames';
import Mensaje from './Mensaje.vue';
import RealizarAccion from './RealizarAccion.vue';

const { playerRoom, playerRoomId, showAccionesDialog, showMensajesDialog, usuario } = useGames();
const roomMain = ref<HTMLDivElement | null>(null);

const { id: roomId } = defineProps<{
    id: string;
}>();

const noIniciado = computed(() =>
{
    return playerRoom.value?.status !== 'progress';
});

const privados = computed(() =>
{
    const participante = playerRoom.value?.participantes?.find((item) => item.id === usuario.value?.uid);
    return playerRoom.value?.privados?.filter((msg) => msg.participante === participante?.name) ?? [];
});

watch(() => playerRoom.value, async () =>
{
    await nextTick();
    if (roomMain.value) {
        const div = roomMain.value;
        div.scrollTo({ top: div.scrollHeight });
    }
});

watch(() => roomId, () =>
{
    playerRoomId.value = roomId;
}, { immediate: true });

</script>
<template>
    <mensaje />
    <realizar-accion />
    <v-app-bar color="primary">
        <v-app-bar-title>Player View - Juego: {{ playerRoom?.gameName }} - Tus mensajes privados</v-app-bar-title>
        <v-label>Participantes:
            {{playerRoom?.participantes?.map((p: { name: string; }) => p.name).join(', ')}}</v-label>
    </v-app-bar>
    <v-main style="height: 100vh;">
        <div v-if="noIniciado"
            class="d-flex flex-column align-center justify-center"
            style="height: 100%;">
            <h1>Esperando a que el GM inicie el juego</h1>
        </div>
        <div else
            class="overflow-y-auto"
            style="height: 100%;"
            ref="roomMain">
            <v-row>
                <v-col>
                    <v-list>
                        <v-list-item v-for="msg in privados"
                            :key="msg.mensaje">
                            <div class="d-flex flex-row">
                                <div class="pa-1 player">{{ msg.sender }}:</div>
                                <div class="pa-1" v-html="msg.mensaje" />
                            </div>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex flex-row">
                    <v-btn class="mr-4"
                        @click="showAccionesDialog = true">Realizar Acción...</v-btn>
                    <v-btn class="mr-4"
                        @click="showMensajesDialog = { show: true, tipo: 'publico' }">Enviar Mensaje Público</v-btn>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>