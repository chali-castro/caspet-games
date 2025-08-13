import { storeToRefs } from 'pinia';
import gamesStore from '../stores/gamesStore';

export default () =>
{ 
    const store = gamesStore();
    const { gmRoom, loggedIn, gmRommId, playerRoom, playerRoomId, rooms, showNewRoomDialog, showMensajesDialog, usuario } = storeToRefs(store);
    const { createRoom, empezarJuego, puedeAccederGM, puedeAccederPlayer, puedeEmpezar, puedeUnirse, sendMessage, unirse } = store;

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
        puedeAccederGM,
        puedeAccederPlayer,
        puedeEmpezar,
        puedeUnirse,
        sendMessage,
        unirse
    };
};