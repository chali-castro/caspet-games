import { defineStore } from 'pinia';
import { CRoom } from '../model/room';
import { computed, ref, watch } from 'vue';
import { addDoc, collection, doc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useCollection, useDocument } from 'vuefire';

export default defineStore('games', () =>
{
    const functions = getFunctions();
    const callEmpezarJuego = httpsCallable(functions, 'empezarJuego', { limitedUseAppCheckTokens: true });
    const callEnviarMensaje = httpsCallable(functions, 'enviarMensaje', { limitedUseAppCheckTokens: true });
    const usuario = ref<User | null>(null);

    const rooms = ref<CRoom[]>([]);
    const showNewRoomDialog = ref(false);
    const showMensajesDialog = ref<{ show: boolean, tipo: string; }>({ show: false, tipo: '' });

    const colRooms = useCollection(collection(firestore, 'rooms'));
    const gmRommId = ref<string | null>(null);
    const gmRoom = ref<CRoom | null>(null);
    const gmRoomSource = computed(() => gmRommId.value ? doc(collection(firestore, 'rooms'), gmRommId.value): null);
    const { data: gmRoomData } = useDocument(() => gmRoomSource.value);
    const playerRommId = ref<string | null>(null);
    const playerRoom = ref<CRoom | null>(null);
    const playerRoomSource = computed(() => playerRommId.value ? doc(collection(firestore, 'rooms'), playerRommId.value) : null);
    const { data: playerRoomData } = useDocument(() => playerRoomSource.value);

    watch(() => gmRoomData.value, () =>
    {
        if (gmRommId.value && gmRoomData.value) {
            gmRoom.value = CRoom.fromFirestore(gmRommId.value, gmRoomData.value, usuario.value?.displayName ?? '');
        }
    });

    watch(() => playerRoomData.value, () =>
    {
        if (playerRommId.value && playerRoomData.value) {
            playerRoom.value = CRoom.fromFirestore(playerRommId.value, playerRoomData.value, usuario.value?.displayName ?? '');
        }
    });

    watch(() => colRooms.value,
        () =>
        {
            console.log('Rooms updated:', colRooms.value);
            rooms.value = colRooms.value.map((doc) => CRoom.fromFirestore(doc.id, doc, usuario.value!.displayName ?? ''));
        });

    onAuthStateChanged(auth, (user) =>
    {
        if (user) {
            usuario.value = user;
        } else {
            usuario.value = null;
        }
    });


    return {
        rooms,
        showNewRoomDialog,
        showMensajesDialog,
        gmRoom,
        playerRoom,
        usuario,
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
        accederGM: (room: CRoom) =>
        {
            gmRommId.value = room.id;
        },
        puedeAcceder: (room: CRoom) =>
        {
            if (room.participantes.some((item) => item.id === usuario.value?.uid)) {
                return true;
            }
            return false;
        },
        accederJugador: (room: CRoom) =>
        {
            playerRommId.value = room.id;
        },
        sendMessage: async (tipo: string, message: string) =>
        {
            await callEnviarMensaje({ roomId: playerRommId.value, userName: usuario.value?.displayName, tipo, mensaje: message });
        },
    };
});
