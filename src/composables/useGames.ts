import { storeToRefs } from 'pinia';
import gamesStore from '../stores/gamesStore';

export default () =>
{ 
    const store = gamesStore();
    const { gmRoom, playerRoom, rooms, showNewRoomDialog, showMensajesDialog, usuario } = storeToRefs(store);
    const { accederGM, accederJugador,createRoom, empezarJuego, puedeAcceder, sendMessage } = store;

    return {
        showNewRoomDialog,
        showMensajesDialog,
        gmRoom,
        usuario,
        rooms,
        createRoom,
        playerRoom,
        empezarJuego,
        accederGM,
        accederJugador,
        puedeAcceder,
        sendMessage
    };
};