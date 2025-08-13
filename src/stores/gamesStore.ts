import { defineStore } from 'pinia';
import { CRoom } from '../model/room';
import { computed, ref, watch } from 'vue';
import { addDoc, collection, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useCollection, useCurrentUser, useDocument, useFirestore } from 'vuefire';

export default defineStore('games', () =>
{
    const firestore = useFirestore();
    const functions = getFunctions();
    const callEmpezarJuego = httpsCallable(functions, 'empezarJuego', { limitedUseAppCheckTokens: true });
    const callEnviarMensaje = httpsCallable(functions, 'enviarMensaje', { limitedUseAppCheckTokens: true });
    const usuario = useCurrentUser();

    const rooms = ref<CRoom[]>([]);
    const showNewRoomDialog = ref(false);
    const showMensajesDialog = ref<{ show: boolean, tipo: string; }>({ show: false, tipo: '' });

    const { data: colRooms, pending: colRoomsPending } = useCollection(() => usuario.value != null ? collection(firestore, 'rooms') : null);
    const gmRommId = ref<string | null>(null);
    const gmRoom = ref<CRoom | null>(null);
    const gmRoomSource = computed(() => gmRommId.value ? doc(collection(firestore, 'rooms'), gmRommId.value) : null);
    const { data: gmRoomData } = useDocument(() => gmRoomSource.value, { wait: true });
    const playerRoomId = ref<string | null>(null);
    const playerRoom = ref<CRoom | null>(null);
    const playerRoomSource = computed(() => playerRoomId.value ? doc(collection(firestore, 'rooms'), playerRoomId.value) : null);
    const { data: playerRoomData } = useDocument(() => playerRoomSource.value, { wait: true });

    watch(() => gmRoomData.value, () =>
    {
        if (gmRommId.value && gmRoomData.value) {
            gmRoom.value = CRoom.fromFirestore(gmRommId.value, gmRoomData.value, usuario.value?.uid ?? '');
        }
    });

    watch(() => playerRoomData.value, () =>
    {
        if (playerRoomId.value && playerRoomData.value) {
            playerRoom.value = CRoom.fromFirestore(playerRoomId.value, playerRoomData.value, usuario.value?.uid ?? '');
        }
    });

    watch(() => colRooms.value, () =>
    {
        console.log('Rooms collection updated:', colRooms.value.length, colRooms.value);
        rooms.value = colRooms.value.map((doc) => CRoom.fromFirestore(doc.id, doc, usuario.value!.uid ?? ''));
    });

    watch(() => colRoomsPending.value, () =>
    {
        console.log('Rooms collection pending:', colRoomsPending.value);
    });

    return {
        rooms,
        showNewRoomDialog,
        showMensajesDialog,
        gmRoom,
        gmRommId,
        playerRoom,
        playerRoomId,
        usuario,
        loggedIn: computed(() => !!usuario.value),
        createRoom: async (room: CRoom) =>
        {
            // Logic to create a new room
            await addDoc(collection(firestore, 'rooms'), {
                name: room.name
            });
        },
        empezarJuego: async (room: CRoom) =>
        {
            await callEmpezarJuego(room.id);
            gmRommId.value = room.id;
        },
        puedeAcceder: (room: CRoom) =>
        {
            if (room.participantes.some((item) => item.id === usuario.value?.uid)) {
                return true;
            }
            return false;
        },
        sendMessage: async (tipo: string, message: string) =>
        {
            const roomId = playerRoomId.value;
            const userName = playerRoom.value?.participantes.find((p) => p.id === usuario.value?.uid)?.name ?? undefined;

            if (roomId && userName) {
                await callEnviarMensaje({ roomId, userName, tipo, mensaje: message });
            }
        },
    };
});
