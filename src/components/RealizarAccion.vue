<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import useGames from '../composables/useGames';
import type { IAccion } from '../model/room';

const { showAccionesDialog, playerRoom, sendMessage } = useGames();

const accionSeleccionada = ref<IAccion | null>(null);
const opcionSeleccionada = ref<string | null>(null);

const valid = computed(() => accionSeleccionada.value && (!accionSeleccionada.value.actuanCon || (accionSeleccionada.value.actuanCon?.length == 0 || opcionSeleccionada.value)));

const realizarAccion = async () =>
{
    if (!playerRoom.value) return;

    let mensaje = `Realizar acción: ${accionSeleccionada.value?.nombre}`;
    if (opcionSeleccionada.value) {
        mensaje += ` con opción: ${opcionSeleccionada.value}`;
    }
    const resultados = [];
    for (let ii = 0; ii < (accionSeleccionada.value?.dados?.cantidad ?? 0); ii++) {
        const tipoDado = accionSeleccionada.value?.dados?.tipo || 'd6';
        let resultado = 0;
        switch (tipoDado) {
            case 'd4':
                resultado = Math.floor(Math.random() * 4) + 1; // Simula un dado de 4 caras
                break;
            case 'd6':
                resultado = Math.floor(Math.random() * 6) + 1; // Simula un dado de 6 caras
                break;
            case 'd8':
                resultado = Math.floor(Math.random() * 8) + 1; // Simula un dado de 8 caras
                break;
            case 'd10':
                resultado = Math.floor(Math.random() * 10) + 1; // Simula un dado de 10 caras
                break;
            case 'd12':
                resultado = Math.floor(Math.random() * 12) + 1; // Simula un dado de 12 caras
                break;
            case 'd20':
                resultado = Math.floor(Math.random() * 20) + 1; // Simula un dado de 20 caras
                break;
            // Agregar más casos según sea necesario
        }
        resultados.push(resultado);
    }

    if (resultados.length > 0) {
        mensaje += ` resultados de los dados: [${resultados.join(', ')}]`;
    }
    await sendMessage('privado', mensaje);
    showAccionesDialog.value = false;
};

watch(() => accionSeleccionada.value, (newValue, oldValue) =>
{
    if (!newValue || newValue !== oldValue) {
        opcionSeleccionada.value = null;
    }
}, { immediate: true });
</script>

<template>
    <v-dialog v-model="showAccionesDialog"
        max-width="50%">
        <v-card>
            <v-card-title>Realizar Acción</v-card-title>
            <v-card-text>
                <v-select v-model="accionSeleccionada"
                    :items=playerRoom?.acciones
                    label="Acción a realizar"
                    item-title="nombre"
                    return-object
                    clearable
                    required />
                <v-select :disabled="!accionSeleccionada || (accionSeleccionada.actuanCon?.length ?? 0) == 0"
                    v-model="opcionSeleccionada"
                    :items="accionSeleccionada?.actuanCon"
                    clearable
                    label="Actúa con..." />
                <v-text-field v-if="accionSeleccionada && (accionSeleccionada.dados?.cantidad ?? 0) > 0"
                    :value="`Esta acción requiere tirar dados para determinar el resultado con las probabilidades ${accionSeleccionada.dados?.condicionesExito}`"
                    disabled />
            </v-card-text>
            <v-card-actions>
                <v-btn @click="showAccionesDialog = false">Cancelar</v-btn>
                <v-btn @click="realizarAccion"
                    :disabled="!valid">Aceptar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>