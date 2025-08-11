<script setup lang="ts">
import { ref } from 'vue';
import useGames from '../composables/useGames';

const { showMensajesDialog, sendMessage } = useGames();

const mensaje = ref('');

const enviarMensaje = () =>
{
    sendMessage(showMensajesDialog.value.tipo, mensaje.value);

    showMensajesDialog.value.show = false;
};

</script>
<template>
    <v-dialog width="50%"
        v-model="showMensajesDialog.show">
        <v-card>
            <v-card-title>
                <span>Enviar mensaje {{ showMensajesDialog.tipo }} </span>
            </v-card-title>
            <v-card-text>
                <v-textarea v-model="mensaje"
                    label="Mensaje" />
            </v-card-text>
            <v-card-actions>
                <v-btn @click="enviarMensaje">Enviar</v-btn>
                <v-btn @click="showMensajesDialog.show = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>