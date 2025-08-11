import { defineStore } from 'pinia';
import { CRoom } from '../model/room';
import { ref } from 'vue';
import { addDoc, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default defineStore('games', () =>
{
    const functions = getFunctions();
    const callEmpezarJuego = httpsCallable(functions, 'empezarJuego', { limitedUseAppCheckTokens: true });
    const callLeerReglamento = httpsCallable(functions, 'leerReglamento', { limitedUseAppCheckTokens: true });

    const rooms = ref<CRoom[]>([]);
    const showNewRoomDialog = ref(false);
    const currentGame = ref<CRoom | null>(null);
    const getRooms = async () =>
    {
        const querySnapshot = await getDocs(collection(firestore, 'rooms'));
        rooms.value = await Promise.all(querySnapshot.docs.map(async (doc) => await CRoom.fromFirestore(doc.id, doc.data())));
    };

    return {
        rooms,
        showNewRoomDialog,
        getRooms,
        currentGame,
        createRoom: async (room: CRoom) =>
        {
            // Logic to create a new room
            await addDoc(collection(firestore, 'rooms'), {
                name: room.name
            });

            await getRooms();
        },
        empezarJuego: async (room: CRoom) =>
        {
            await callEmpezarJuego(room.id);
            const roomRef = doc(firestore, 'rooms', room.id);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                currentGame.value = await CRoom.fromFirestore(roomSnap.id, roomSnap.data());
            }
        },
        leerReglamento: async () =>
        {
            currentGame.value!.reglamento = (await callLeerReglamento(currentGame.value!.id)).data as string;
        }
    };
});
