import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {runWith} from "firebase-functions/v1";
import {genAI} from "..";

const empezarJuego = runWith({enforceAppCheck: true})
  .https
  .onCall(async (roomId: string) => {
    const firestore = getFirestore();
    const roomSnapshot = await firestore.doc(`rooms/${roomId}`).get();
    if (!roomSnapshot.exists) {
      throw new Error(`Room with ID ${roomId} does not exist.`);
    }
    const roomData = roomSnapshot.data();
    const tipo = roomData?.tipo;
    const players = await Promise.all(roomData?.participantes.map(
      async (item: DocumentReference) => {
        const participante = (await item.get()).data();
        return participante !== undefined ? participante.name : "";
      }));

    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
    });

    if (!chat) {
      throw new Error("Failed to create chat instance.");
    }

    const msg1 = `Quiero un juego de ${tipo}`;
    const msg2 = `para ${roomData?.participantes.length}`;
    const msg3 = `participantes: ${players.join(", ")}`;
    const msg4 = "donde tú seras el GM e interactuaras con los jugadores";
    const msg5 = "no me des información";
    const msg6 = "luego te los iré pidiendo los detalles";

    await chat.sendMessage({
      message: `${msg1}, ${msg2} ${msg3}, ${msg4}; ${msg5}, ${msg6}`,
    });

    const nombre = await chat.sendMessage({
      message: "Dime el nombre de juego en formato texto simple",
    });

    await firestore.doc(`rooms/${roomId}`).update({
      gameName: nombre.text,
      historyChat: JSON.stringify(chat.getHistory()),
      status: "progress",
    });
  });

const leerReglamento = runWith({enforceAppCheck: true})
  .https
  .onCall(async (roomId: string) => {
    const firestore = getFirestore();
    const roomSnapshot = await firestore.doc(`rooms/${roomId}`).get();
    if (!roomSnapshot.exists) {
      throw new Error(`Room with ID ${roomId} does not exist.`);
    }
    const roomData = roomSnapshot.data();
    if (roomData?.reglamento) {
      return roomData.reglamento;
    }

    const chatHistory = roomData?.historyChat ?
      JSON.parse(roomData.historyChat) :
      "[]";

    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
    });

    if (chat) {
      console.log(`Chat found for room: ${roomId}`);
      const reglamento = await chat.sendMessage({
        message: "Dame el reglamento del juego, " +
          "en formato HTML para incrustarlos dentro de un DIV",
      });

      const chatHistory = chat.getHistory();

      await firestore.doc(`rooms/${roomId}`).update({
        reglamento: reglamento.text,
        historyChat: JSON.stringify(chatHistory),
      });
      return reglamento.text;
    }

    return "";
  });

export {empezarJuego, leerReglamento};
