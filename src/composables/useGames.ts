import { storeToRefs } from 'pinia';
import gamesStore from '../stores/gamesStore';
import { computed } from 'vue';

export default () =>
{ 
    const store = gamesStore();
    const { currentGame, rooms, showNewRoomDialog } = storeToRefs(store);
    const { createRoom, empezarJuego, getRooms, leerReglamento } = store;

    return {
        showNewRoomDialog,
        currentGame,
        rooms: computed(() =>
        {
            if (rooms.value.length === 0)
            {
                getRooms();
            }
            return rooms.value;
        }),
        createRoom,
        empezarJuego,
        leerReglamento
    };
};