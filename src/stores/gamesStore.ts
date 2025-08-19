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
    const currentLoaders = ref<boolean[]>([]);

    const showNewRoomDialog = ref(false);
    const showMensajesDialog = ref<{ show: boolean, tipo: string; }>({ show: false, tipo: '' });
    const showAccionesDialog = ref(false);

    const roomsQry = computed(() => usuario.value != null ?
        query(
            collection(firestore, 'rooms'),
            where('public', '==', true)) :
        null);
    const { data: rooms, pending: colRoomsPending } = useCollection<CRoom>(() => roomsQry.value, { wait: true });
    const gmRommId = ref<string | null>(null);
    const gmRoomSource = computed(() => gmRommId.value ? doc(collection(firestore, 'rooms'), gmRommId.value) : null);
    const { data: gmRoom, pending: gmRoomPending } = useDocument<CRoom>(() => gmRoomSource.value, { wait: true });
    const playerRoomId = ref<string | null>(null);
    const playerRoomSource = computed(() => playerRoomId.value ? doc(collection(firestore, 'rooms'), playerRoomId.value) : null);
    const { data: playerRoom, pending: playerRoomPending } = useDocument<CRoom>(() => playerRoomSource.value, { wait: true });

    const setLoader = (loader: boolean = true): void =>
    {
        if (loader) {
            currentLoaders.value.push(loader);
        }
        else {
            currentLoaders.value.pop();
        }
    };

    watch(() => colRoomsPending.value, () =>
    {
        setLoader(colRoomsPending.value);
    });

    watch(() => gmRoomPending.value, () =>
    {
        setLoader(gmRoomPending.value);
    });

    watch(() => playerRoomPending.value, () =>
    {
        setLoader(playerRoomPending.value);
    });

    return {
        isLoading: computed(() => currentLoaders.value.length > 0),
        rooms,
        showNewRoomDialog,
        showMensajesDialog,
        showAccionesDialog,
        gmRoom,
        gmRommId,
        playerRoom,
        playerRoomId,
        usuario,
        loggedIn: computed(() => !!usuario.value),
        createRoom: async (room: CRoom) =>
        {
            setLoader();
            try {
                // Logic to create a new room
                await addDoc(collection(firestore, 'rooms'), {
                    name: room.name,
                    tipo: room.tipo,
                    owner: doc(collection(firestore, 'users'), usuario.value?.uid),
                    players: [doc(collection(firestore, 'users'), usuario.value?.uid)],
                    public: true,
                    userCharacteristics: room.userCharacteristics,
                    rounds: room.rounds,
                    actionsPerRound: room.actionsPerRound,
                    useDice: room.useDice,
                    bots: room.bots,
                    status: 'created',
                });
            }
            finally {
                setLoader(false);
            }
        },
        empezarJuego: async (room: CRoom) =>
        {
            setLoader();
            try {
                await callEmpezarJuego({ roomId: room.id });
                gmRommId.value = room.id;
            }
            finally {
                setLoader(false);
            }
        },
        unirse: async (room: CRoom) =>
        {
            setLoader();
            try {
                await updateDoc(doc(collection(firestore, 'rooms'), room.id), {
                    players: arrayUnion(doc(collection(firestore, 'users'), usuario.value?.uid))
                });
                router.push({ name: 'RoomPlayer', params: { id: room.id } });
            }
            finally {
                setLoader(false);
            }
        },
        puedeEmpezar: (room: CRoom) => room.status === 'created' && room.owner?.id === usuario.value?.uid,
        puedeAccederGM: (room: CRoom) => room.status === 'progress' && room.owner?.id === usuario.value?.uid,
        puedeAccederPlayer: (room: CRoom) => room.status === 'progress' && room.players?.some((item) => item.id === usuario.value?.uid)
            || (room.status === 'created') && room.owner?.id !== usuario.value?.uid && room.players?.some((item) => item.id === usuario.value?.uid),
        puedeUnirse: (room: CRoom) => room.status === 'created' && room.public && !room.players?.some((item) => item.id === usuario.value?.uid),
        sendMessage: async (tipo: string, message: string, diceRolls?: number[]) =>
        {
            setLoader();
            try {
                const roomId = playerRoomId.value;
                const userName = playerRoom.value?.players?.find((p) => p.id === usuario.value?.uid)?.name ?? undefined;

                if (roomId && userName) {
                    await callEnviarMensaje({ roomId, userName, typeMsg: tipo, message, diceRolls });
                }
            }
            finally {
                setLoader(false);
            }
        },
    };
});
