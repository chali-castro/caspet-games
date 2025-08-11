<script setup lang="ts">
import { onMounted } from 'vue';
import useGames from '../composables/useGames';

const { currentGame, leerReglamento } = useGames();

onMounted(async () =>
{
    // Fetch any necessary data or perform actions when the component is mounted
    if (currentGame.value!.reglamento === undefined) {
        await leerReglamento();
    }
});

</script>
<template>
    <v-container>
        <v-row>
            <v-col>
                <h2>Game Master View</h2>
                <p>Room ID: {{ currentGame!.id }}</p>
                <p>Nombre del juego: {{ currentGame!.gameName }}</p>
                <p>Participantes: {{ currentGame!.listaParticipantes }}</p>
                <p v-html="currentGame!.reglamento" />
            </v-col>
        </v-row>
    </v-container>
</template>