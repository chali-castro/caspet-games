import { storeToRefs } from 'pinia';
import gamesStore from '../stores/gamesStore';

export default () =>
{ 
    const store = gamesStore();
    const { gmRoom, loggedIn, gmRommId, playerRoom, playerRoomId, rooms, showNewRoomDialog, showMensajesDialog, usuario } = storeToRefs(store);
    const { createRoom, empezarJuego, puedeAcceder, sendMessage } = store;

    return {
        loggedIn,
        showNewRoomDialog,
        showMensajesDialog,
        gmRoom,
        gmRommId,
        usuario,
        rooms,
        createRoom,
        playerRoom,
        playerRoomId,
        empezarJuego,
        puedeAcceder,
        sendMessage
    };
};