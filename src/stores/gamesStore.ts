import { defineStore } from 'pinia';
import { CRoom } from '../model/room';
import { ref } from 'vue';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

export default defineStore('games', () =>
{
    const rooms = ref<CRoom[]>([]);
    const showNewRoomDialog = ref(false);

    const getRooms = async () =>
    {
        const querySnapshot = await getDocs(collection(firestore, 'rooms'));
        rooms.value = await Promise.all(querySnapshot.docs.map(async (doc) => await CRoom.fromFirestore(doc.id, doc.data())));
    };

    return {
        rooms,
        showNewRoomDialog,
        getRooms,
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
            // Logic to start a game in the room
            console.log(`Starting game in room: ${room.name}`);
            // Additional logic can be added here
        }
    };
});
