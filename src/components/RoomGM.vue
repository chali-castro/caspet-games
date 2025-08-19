<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import useGames from '../composables/useGames';
import CastButton from './CastButton.vue';

const { gmRoom, gmRommId } = useGames();
const roomMain = ref<HTMLDivElement | null>(null);

const {id: roomId} = defineProps<{
    id: string;
}>();

watch(() => gmRoom.value, async () =>
{
    await nextTick();
    if (roomMain.value) {
        const div = roomMain.value;
        div.scrollTo({ top: div.scrollHeight });
    }
});

watch(() => roomId, () =>
{
    gmRommId.value = roomId;
}, { immediate: true });

</script>
<template>
    <v-app-bar color="primary">
        <v-app-bar-title>Game Master View - Juego: {{ gmRoom?.gameName }} - Mensajes privados</v-app-bar-title>
        <cast-button />
        <v-label>Participantes: {{ gmRoom?.players?.map((p: { name: string; }) => p.name).join(', ') }}</v-label>
    </v-app-bar>
    <v-main style="height: 100vh;">
        <div class="overflow-y-auto"
            style="height: 100%;"
            ref="roomMain">
            <v-row>
                <v-col>
                    <v-list>
                        <v-list-item v-for="msg in gmRoom?.publics"
                            :key="msg.message">
                            <div class="d-flex flex-row">
                                <div class="pa-1 player">{{ msg.sender }}:</div>
                                <div class="pa-1" v-html="msg.message" />
                            </div>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>