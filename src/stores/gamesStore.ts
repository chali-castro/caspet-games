import { defineStore } from 'pinia';
import { type CRoom } from '../model/room';
import { computed, ref, watch } from 'vue';
import { addDoc, arrayUnion, collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useCollection, useCurrentUser, useDocument, useFirestore } from 'vuefire';
import router from '../router';

export default defineStore('games', () =>
{
    const firestore = useFirestore();
    const functions = getFunctions();
    const callEmpezarJuego = httpsCallable(functions, 'empezarJuego', { limitedUseAppCheckTokens: true });
    const callEnviarMensaje = httpsCallable(functions, 'enviarMensaje', { limitedUseAppCheckTokens: true });
    const usuario = useCurrentUser();

    const showNewRoomDialog = ref(false);
    const showMensajesDialog = ref<{ show: boolean, tipo: string; }>({ show: false, tipo: '' });

    const roomsQry = computed(() => usuario.value != null ?
        query(
            collection(firestore, 'rooms'),
            where('public', '==', true)) :
        null);
    const { data: rooms, pending: colRoomsPending } = useCollection<CRoom>(() => roomsQry.value, { wait: true });
    const gmRommId = ref<string | null>(null);
    const gmRoomSource = computed(() => gmRommId.value ? doc(collection(firestore, 'rooms'), gmRommId.value) : null);
    const { data: gmRoom } = useDocument<CRoom>(() => gmRoomSource.value, { wait: true });
    const playerRoomId = ref<string | null>(null);
    const playerRoomSource = computed(() => playerRoomId.value ? doc(collection(firestore, 'rooms'), playerRoomId.value) : null);
    const { data: playerRoom } = useDocument<CRoom>(() => playerRoomSource.value, { wait: true });

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
                name: room.name,
                tipo: room.tipo,
                status: 'created',
                creadoPor: doc(collection(firestore, 'users'), usuario.value?.uid),
                participantes: [doc(collection(firestore, 'users'), usuario.value?.uid)],
                public: true
            });
        },
        empezarJuego: async (room: CRoom) =>
        {
            await callEmpezarJuego(room.id);
            gmRommId.value = room.id;
        },
        unirse: async (room: CRoom) =>
        {
            await updateDoc(doc(collection(firestore, 'rooms'), room.id), {
                participantes: arrayUnion(doc(collection(firestore, 'users'), usuario.value?.uid))
            });
            router.push({ name: 'RoomPlayer', params: { id: room.id } });
        },
        puedeEmpezar: (room: CRoom) => room.status === 'created' && room.creadoPor?.id === usuario.value?.uid,
        puedeAccederGM: (room: CRoom) => room.status === 'progress' && room.creadoPor?.id === usuario.value?.uid,
        puedeAccederPlayer: (room: CRoom) => room.status === 'progress' && room.participantes?.some((item) => item.id === usuario.value?.uid)
            || (room.status === 'created') && room.creadoPor?.id !== usuario.value?.uid && room.participantes?.some((item) => item.id === usuario.value?.uid),
        puedeUnirse: (room: CRoom) => room.status === 'created' && room.public && !room.participantes?.some((item) => item.id === usuario.value?.uid),
        sendMessage: async (tipo: string, message: string) =>
        {
            const roomId = playerRoomId.value;
            const userName = playerRoom.value?.participantes?.find((p) => p.id === usuario.value?.uid)?.name ?? undefined;

            if (roomId && userName) {
                await callEnviarMensaje({ roomId, userName, tipo, mensaje: message });
            }
        },
    };
});
