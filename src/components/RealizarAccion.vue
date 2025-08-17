<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useGames from '../composables/useGames';
import type { IAccion, IAccionOpciones } from '../model/room';

const { showAccionesDialog, playerRoom, sendMessage, usuario } = useGames();

const accionesDisponibles = computed(() => {
    const player = playerRoom.value?.players?.find((item) => item.id === usuario.value?.uid);
    return playerRoom.value?.actions?.filter((action) => action.players.some((p) => p === player?.name)) ?? [];
});

const accionSeleccionada = ref<IAccion | null>(null);
const opcionSeleccionada = ref<IAccionOpciones | null>(null);
const opcionAdicionalSeleccionada = ref<string | null>(null);

const resultadoDados = ref<number[]>([]);
const valid = computed(() =>
    accionSeleccionada.value &&
    (!requiereOpcion.value || estaOpcionSeleccionada.value) &&
    (!requiereOpcionAdicional.value || estaOpcionAdicionalSeleccionada.value)
);

const estaAccionSeleccionada = computed(() => !!accionSeleccionada.value);
const estaOpcionSeleccionada = computed(() => !!opcionSeleccionada.value);
const estaOpcionAdicionalSeleccionada = computed(() => !!opcionAdicionalSeleccionada.value);
const requiereOpcion = computed(() => estaAccionSeleccionada.value && (accionSeleccionada.value!.targets?.length ?? 0) > 0);
const requiereOpcionAdicional = computed(() => estaOpcionSeleccionada.value && (opcionSeleccionada.value!.secondTargets?.length ?? 0) > 0);
const textResultadoDados = computed(() => {
    if (resultadoDados.value.length === 0) return '';
    return `Resultados de los dados: [${resultadoDados.value.join(', ')}]`;
});

const realizarAccion = async () =>
{
    if (!playerRoom.value || !accionSeleccionada.value) return;


    let mensaje = accionSeleccionada.value.format;
    mensaje = mensaje.replace(/\${action}/g, accionSeleccionada.value.name);
    mensaje = mensaje.replace(/\${target}/g, opcionSeleccionada.value?.name || '');
    mensaje = mensaje.replace(/\${secondTarget}/g, opcionAdicionalSeleccionada.value || '');

    for (let ii = 0; ii < (accionSeleccionada.value.dice?.amount ?? 0); ii++) {
        const tipoDado = accionSeleccionada.value.dice?.type || 'd6';
        let resultado = 0;
        switch (tipoDado.toLowerCase()) {
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
        resultadoDados.value.push(resultado);
    }
    await nextTick();

    await sendMessage('private', mensaje, resultadoDados.value.length > 0 ? resultadoDados.value : undefined);
    showAccionesDialog.value = false;
};

watch(() => accionSeleccionada.value, (newValue, oldValue) =>
{
    if (!newValue || newValue !== oldValue) {
        opcionSeleccionada.value = null;
    }
}, { immediate: true });

watch(() => opcionSeleccionada.value, (newValue, oldValue) =>
{
    if (!newValue || newValue !== oldValue) {
        opcionAdicionalSeleccionada.value = null;
    }
}, { immediate: true });

watch(() => showAccionesDialog.value, () =>
{
    if (!showAccionesDialog.value) {
        opcionAdicionalSeleccionada.value = null;
        opcionSeleccionada.value = null;
        accionSeleccionada.value = null;
        resultadoDados.value = [];
    }
});
</script>

<template>
    <v-dialog v-model="showAccionesDialog"
        max-width="50%">
        <v-card>
            <v-card-title>Realizar Acción</v-card-title>
            <v-card-text>
                <v-select v-model="accionSeleccionada"
                    :items="accionesDisponibles"
                    label="Acción a realizar"
                    item-title="name"
                    clearable
                    return-object
                    required />
                <v-select :disabled="!accionSeleccionada || (accionSeleccionada.targets?.length ?? 0) == 0"
                    v-model="opcionSeleccionada"
                    :items="accionSeleccionada?.targets"
                    item-title="name"
                    clearable
                    return-object
                    label="Opciones..." />
                <v-select :disabled="!opcionSeleccionada || (opcionSeleccionada.secondTargets?.length ?? 0) == 0"
                    v-model="opcionAdicionalSeleccionada"
                    :items="opcionSeleccionada?.secondTargets"
                    clearable
                    label="Opciones secundarias..." />
                <v-textarea v-if="accionSeleccionada && (accionSeleccionada.dice?.amount ?? 0) > 0"
                    rows="4"
                    :value="`Esta acción requiere tirar dados para determinar el resultado con las probabilidades ${accionSeleccionada.dice?.successConditions}`"
                    disabled />
                <v-textarea v-if="resultadoDados.length > 0"
                    rows="1"
                    :value="textResultadoDados"
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