import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {runWith} from "firebase-functions/v1";
import {genAI} from "..";
import { Type } from '@google/genai';

const gameSchema = {
  type: Type.OBJECT,
  properties: {
    nombre: { type: Type.STRING },
    privados: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          participante: { type: Type.STRING },
          mensaje: { type: Type.STRING },
        },
        required: ["participante", "mensaje"]
      }
    },
    publicos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mensaje: { type: Type.STRING },
        },
        required: ["mensaje"]
      }
    }
  },
  required: ["nombre"]
};

const empezarJuego = runWith({
  enforceAppCheck: true,
  secrets: ["GOOGLE_GENAI_API_KEY"],
})
  .https
  .onCall(async (roomId: string) =>
  {
    const firestore = getFirestore();
    const roomSnapshot = await firestore.doc(`rooms/${roomId}`).get();
    if (!roomSnapshot.exists) {
      throw new Error(`Room with ID ${roomId} does not exist.`);
    }
    const roomData = roomSnapshot.data();
    const tipo = roomData?.tipo;
    const players = await Promise.all(roomData?.participantes.map(
      async (item: DocumentReference) =>
      {
        const participante = (await item.get()).data();
        return participante !== undefined ? participante.name : "";
      }));

    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
    });

    if (!chat) {
      throw new Error("Failed to create chat instance.");
    }

    const msg1 = `Quiero un juego ${tipo}`;
    const msg2 = `para ${roomData?.participantes.length}`;
    const msg3 = `participantes: ${players.join(", ")}`;
    const msg4 = "donde tú seras el GM e interactuaras con los jugadores ";
    const msg5 = "con mensajes públicos y privados";
    const msg6 = "en los mensajes públicos puedes enviar los detalles como el reglamento, mensajes de bienvenida y objetivos por separado";
    //const msg5 = "no me des información";
    // const msg6 = "luego te los iré pidiendo los detalles";

    const respGameAI = await chat.sendMessage({
      message: `${msg1}, ${msg2} ${msg3}, ${msg4} ${msg5}, ${msg6}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
      }
    });


    if (respGameAI) {
      const gameAI = JSON.parse(respGameAI.text!);
      console.log(gameAI);
      const publicos = gameAI.publicos.map((item: any) =>
      {
        return { ...item, sender: 'GM'};  
      });
      const privados = gameAI.privados.map((item: any) =>
      {
        return { ...item, sender: 'GM'};  
      });

      await firestore.doc(`rooms/${roomId}`).update({
      gameName: gameAI.nombre,
      publicos,
      privados,
      historyChat: JSON.stringify(chat.getHistory()),
      status: "progress",
    });

    } else {
      console.error("No game AI response received.");
    }
  });

const enviarMensaje = runWith({
  enforceAppCheck: true,
  secrets: ["GOOGLE_GENAI_API_KEY"],
})
  .https
  .onCall(async ({ roomId, userName, tipo, mensaje }) =>
  {
    const firestore = getFirestore();
    const roomSnapshot = await firestore.doc(`rooms/${roomId}`).get();
    if (!roomSnapshot.exists) {
      throw new Error(`Room with ID ${roomId} does not exist.`);
    }
    const roomData = roomSnapshot.data();

    if (!roomData) {
      throw new Error(`No data found for room with ID ${roomId}.`);
    }

    const chatHistory = roomData.historyChat ?
      JSON.parse(roomData.historyChat) :
      "[]";

    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
    });

    if (chat) {
      const respMensaje = await chat.sendMessage({
        message: `${userName} te envía un mensaje ${tipo}: ${mensaje}, solo debes responder con los mensajes nuevos`,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
        }
      });

      if (respMensaje) {
        const mensajes = JSON.parse(respMensaje.text!);
        console.log("Mensajes recibidos:", mensajes);
        const chatHistory = chat.getHistory();
        const privados = roomData['privados'] || [];
        const publicos = roomData['publicos'] || [];

        if (tipo === 'privado') {
          privados.push({ sender: userName, mensaje });
        }
        mensajes.privados.forEach((item: any) => {
          privados.push({...item, sender: 'GM'});
        });

        if (tipo === 'publico') {
          publicos.push({ sender: userName, mensaje });
        }
        mensajes.publicos.forEach((item: any) => {
          publicos.push({...item, sender: 'GM'});
        });

        await firestore.doc(`rooms/${roomId}`).update({
          privados,
          publicos,
          historyChat: JSON.stringify(chatHistory),
        });
      }
      else {
        console.error("No game AI response received.");
      }
    }    
  });

export {empezarJuego, enviarMensaje};
