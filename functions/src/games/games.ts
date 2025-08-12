import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {runWith} from "firebase-functions/v1";
import {genAI} from "..";
import {Type} from "@google/genai";

const gameSchema = {
  type: Type.OBJECT,
  properties: {
    nombre: {type: Type.STRING},
    privados: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          participante: {type: Type.STRING},
          mensaje: {type: Type.STRING},
        },
        required: ["participante", "mensaje"],
      },
    },
    publicos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mensaje: {type: Type.STRING},
        },
        required: ["mensaje"],
      },
    },
    eventos: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["nombre"],
};

const preparaPrompt = async (roomId: string) => {
  const roomSnapshot = await getFirestore().doc(`rooms/${roomId}`).get();
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

  const prompt = `\
Quiero un juego ${tipo} \
para ${roomData?.participantes.length} jugadores, \
los participantes son: ${players.join(", ")} \
donde tú seras el GM e interactuaras con los jugadores \
mediante mensajes públicos y privados y eventos, \
en los mensajes públicos puedes enviar los detalles como: \
el reglamento, mensajes de bienvenida, objetivos y \
la ocurrencias de los eventos \
`;

  return prompt;
};

const empezarJuego = runWith({
  enforceAppCheck: true,
  secrets: ["GOOGLE_GENAI_API_KEY"],
})
  .https
  .onCall(async (roomId: string) => {
    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
    });

    if (!chat) {
      throw new Error("Failed to create chat instance.");
    }

    const respGameAI = await chat.sendMessage({
      message: await preparaPrompt(roomId),
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
      },
    });


    if (respGameAI) {
      const gameAI = respGameAI.text ? JSON.parse(respGameAI.text) : {};

      const publicos = gameAI.publicos.map((item: { mensaje: string }) => {
        return {...item, sender: "GM"};
      });
      const privados = gameAI.privados.map((item:
        {
          mensaje: string,
          participante: string;
        }) => {
        return {...item, sender: "GM"};
      });

      await getFirestore().doc(`rooms/${roomId}`).update({
        gameName: gameAI.nombre,
        publicos,
        privados,
        eventos: gameAI.eventos,
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
  .onCall(async ({roomId, userName, tipo, mensaje}) => {
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
      const prompt = `
Importante: debes responder solamente con los nuevos mensajes y eventos.
${userName} te envía un mensaje ${tipo}: '${mensaje}'.
`;

      const respMensaje = await chat.sendMessage({
        message: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
        },
      });

      if (respMensaje) {
        const mensajes = respMensaje.text ? JSON.parse(respMensaje.text) : {};
        const chatHistory = chat.getHistory();
        const privados = roomData["privados"] || [];
        const publicos = roomData["publicos"] || [];
        const eventos = roomData["eventos"] || [];

        if (tipo === "privado") {
          privados.push({sender: userName, mensaje, participante: userName});
        }
        mensajes.privados.forEach((item: {mensaje: string}) => {
          privados.push({...item, sender: "GM"});
        });

        if (tipo === "publico") {
          publicos.push({sender: userName, mensaje});
        }
        mensajes.publicos.forEach((item: {
          mensaje: string,
          participante: string;
        }) => {
          publicos.push({...item, sender: "GM"});
        });

        // eventos.forEach((item: string) => {
        //   eventos.push(item);
        // });

        await firestore.doc(`rooms/${roomId}`).update({
          privados,
          publicos,
          eventos,
          historyChat: JSON.stringify(chatHistory),
        });
      } else {
        console.error("No game AI response received.");
      }
    }
  });

export {empezarJuego, enviarMensaje};
