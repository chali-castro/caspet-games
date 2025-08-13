<script setup lang="ts">
import { ref } from 'vue';
import useGames from '../composables/useGames';
import { type CRoom } from '../model/room';

const { showNewRoomDialog, createRoom } = useGames();
const roomName = ref('');
const roomType = ref('');
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
            </v-card-text>
            <v-card-actions>
                <v-btn @click="createRoomGame">Create</v-btn>
                <v-btn @click="showNewRoomDialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>