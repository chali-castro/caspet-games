<script setup lang="ts">
import { ref } from 'vue';
import useGames from '../composables/useGames';
import { type CRoom } from '../model/room';

const { showNewRoomDialog, createRoom } = useGames();
const roomName = ref('');
const roomType = ref('');
const roomCharacteristics = ref('');
const roomRounds = ref(10);
const roomActionsPerRound = ref(1);
const roomUseDice = ref(true);
const roomNumberOfBots = ref(0);

const createRoomGame = async () =>
{
    if (roomName.value.trim() === '') {
        alert('Room name cannot be empty');
        return;
    }
    const room: CRoom = {
        id: '',
        name: roomName.value,
        tipo: roomType.value,
        userCharacteristics: roomCharacteristics.value,
        rounds: roomRounds.value,
        actionsPerRound: roomActionsPerRound.value,
        useDice: roomUseDice.value,
        bots: roomNumberOfBots.value,
        status: 'created',
    };

    await createRoom(room);
    showNewRoomDialog.value = false;
};
</script>
<template>
    <v-dialog width="50%"
        v-model="showNewRoomDialog">
        <v-card>
            <v-card-title>
                <span>Crear nueva sala</span>
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="roomName"
                    label="Room Name" />
                <v-text-field v-model="roomType"
                    label="Room Type" />
                <v-textarea v-model="roomCharacteristics"
                    label="Características adicionales"
                    rows="4"
                    auto-grow />
                <v-row>
                    <v-col>
                        <v-number-input v-model="roomRounds"
                            label="Número de rondas"
                            :min="5"
                            :max="50"
                            :step="5" />
                    </v-col>
                    <v-col>
                        <v-number-input v-model="roomActionsPerRound"
                            label="Número de acciones por ronda"
                            :min="1"
                            :max="5"
                            :step="1" />
                    </v-col>
                    <v-col>
                        <v-number-input v-model="roomNumberOfBots"
                            label="Número de bots"
                            :min="0"
                            :max="6"
                            :step="1" />
                    </v-col>
                    <v-col>
                        <v-checkbox-btn v-model="roomUseDice" label="Usar dados" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="createRoomGame">Create</v-btn>
                <v-btn @click="showNewRoomDialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>