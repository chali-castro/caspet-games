<script setup lang="ts">
import { ref } from 'vue';
import useGames from '../composables/useGames';
import { CRoom } from '../model/room';

const { showNewRoomDialog } = useGames();
const roomName = ref('');

const createRoom = async () =>
{
    if (roomName.value.trim() === '') {
        alert('Room name cannot be empty');
        return;
    }
    const room = new CRoom();
    room.name = roomName.value;

    await useGames().createRoom(room);
    showNewRoomDialog.value = false;
};
</script>
<template>
    <v-dialog v-model="showNewRoomDialog">
        <v-card>
            <v-card-title>
                <span>Crear nueva sala</span>
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="roomName"
                    label="Room Name" />
            </v-card-text>
            <v-card-actions>
                <v-btn @click="createRoom">Create</v-btn>
                <v-btn @click="showNewRoomDialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>