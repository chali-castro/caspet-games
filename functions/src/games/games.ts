import {DocumentReference, DocumentSnapshot, getFirestore}
  from "firebase-admin/firestore";
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
    acciones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: {type: Type.STRING},
          descripcion: {type: Type.STRING},

          actuanCon: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          dados: {
            type: Type.OBJECT,
            properties: {
              tipo: {type: Type.STRING},
              cantidad: {type: Type.NUMBER},
              condicionesExito: {type: Type.STRING},
              efectos: {type: Type.STRING},
            },
            required: ["tipo", "cantidad"],
          },
        },
        required: ["nombre", "descripcion"],
      },
    },
    personajes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: {type: Type.STRING},
          tipo: {type: Type.STRING},
          historia: {type: Type.STRING},
        },
        required: ["nombre", "tipo", "historia"],
      },
    },
    localizaciones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: {type: Type.STRING},
          tipo: {type: Type.STRING},
          detalles: {type: Type.STRING},
        },
        required: ["nombre", "tipo", "detalles"],
      },
    },
    eventos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          descripcion: {type: Type.STRING},
          explicacion: {type: Type.STRING},
        },
        required: ["descripcion"],
      },
    },
    porcentajeAvance: {type: Type.NUMBER},
  },
  required: ["nombre", "porcentajeAvance"],
};

const preparaPrompt = async (roomSnap: DocumentSnapshot) => {
  if (!roomSnap.exists) {
    throw new Error(`Room with ID ${roomSnap.id} does not exist.`);
  }
  const roomData = roomSnap.data();
  const tipo = roomData?.tipo;
  const players = await Promise.all(roomData?.participantes.map(
    async (item: DocumentReference) => {
      const participante = (await item.get()).data();
      return participante !== undefined ? participante.name : "";
    }));

  const prompt = `
Crea para la sala '${roomData?.id} (${roomData?.nombre})' un juego ${tipo} \
para ${roomData?.participantes.length} jugadores, \
los participantes son: ${players.join(", ")} \
donde tú seras el GM e interactuaras con los jugadores \
mediante mensajes públicos y privados y eventos, \
en los mensajes públicos debes enviar los detalles como: \
el reglamento, mensajes de bienvenida, información general, objetivos, \
la ocurrencias de los eventos y \
la explicación de todas las acciones posibles de realizar por los jugadores; \
en los mensajes privados debes enviar los detalles como: \
los mensajes privados deben incluir información detallada \
sensible o específica para cada jugador, como su rol, \
habilidades, objetivos personales y las acciones que pueden realizar. \
El juego debe constar de 10 rondas, \
los usuario pueden realizar una acción por ronda. \
Las rondas terminan cuando todos los jugadores hayan realizado su acción. \
Al terminar la ronda debes informar del estado de los jugadores \
y de los eventos ocurridos. \
También es posible que al terminar la ronda \
se actualicen las acciones que se puedan realizar. \
Los mensajes deben estar en formato HTML para ser inscrustado en un tag DIV. \
Las acciones deben ser claras y específicas, \
indicando qué se puede hacer en cada momento del juego, \
el resultado de algunas acciones dependeran de \
el valor de un lanzamiento de dados, \
en ese caso dime las condiciones de éxito y fracaso, \
y en las acciones importantes éxito rotundo y/o fracaso estrepitoso, \
indica también sus efectos en cada caso. \
Describe a los personajes inclusive a los NPC (non-player characters), \
sus opciones y cómo pueden interactuar con el entorno del juego.
Tambien describe las localizacion (habitaciones, lugares, caminos, etc.) \
si existieran.
`;

  return prompt;
};

const empezarJuego = runWith({
  enforceAppCheck: true,
  secrets: ["GOOGLE_GENAI_API_KEY"],
})
  .https
  .onCall(async (roomId: string) => {
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);
    // const chat = genAI.chats.create({
    //   model: "gemini-2.5-flash",
    // });

    await firestore.runTransaction(async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      const prompt = await preparaPrompt(roomSnap);

      const respGameAI = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
        },
      });


      if (respGameAI) {
        console.log("Game AI response received:", respGameAI);

        const contentAI = [{
          role: "user",
          parts: [{text: prompt}],
        },
        {
          role: "model",
          parts: [{text: respGameAI.text}],
        },
        ];
        const aiCache = await genAI.caches.create({
          model: "gemini-2.5-flash",
          config: {
            displayName: `Game: ${roomId}[1]`,
            contents: contentAI,
            ttl: "3600s",
          },
        });

        if (!aiCache) {
          throw new Error("Failed to create AI cache instance.");
        }

        const gameAI = respGameAI.text ? JSON.parse(respGameAI.text) : {};

        const publicos = gameAI.publicos.map((item: { mensaje: string; }) => {
          return {...item, sender: "GM"};
        });
        const privados = gameAI.privados.map((item:
          {
            mensaje: string,
            participante: string;
          }) => {
          return {...item, sender: "GM"};
        });

        transaction.update(roomRef, {
          gameName: gameAI.nombre,
          publicos,
          privados,
          eventos: gameAI.eventos,
          acciones: gameAI.acciones,
          personajes: gameAI.personajes,
          cacheAI: aiCache.name,
          history: contentAI,
          status: "progress",
        });
      } else {
        console.error("No game AI response received.");
      }
    });
  });

const enviarMensaje = runWith({
  enforceAppCheck: true,
  secrets: ["GOOGLE_GENAI_API_KEY"],
})
  .https
  .onCall(async ({roomId, userName, tipo, mensaje}) => {
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);

    await firestore.runTransaction(async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists) {
        throw new Error(`Room with ID ${roomId} does not exist.`);
      }
      const roomData = roomSnap.data();

      if (!roomData) {
        throw new Error(`No data found for room with ID ${roomId}.`);
      }

      const prompt = `
${userName} te envía un mensaje ${tipo}: '${mensaje}'.
En la respuesta considera los siguientes puntos:
1. El contexto del juego y la situación actual. \
2. Las acciones recientes de los jugadores. \
3. Cualquier evento relevante que haya ocurrido. \
4. No incluyas los mensajes públicos y privados anteriores. \
5. No incluyas los eventos. \
6. Si se han lanzado dados incluye el resultado en los mensajes privados.
`;

      const respMensaje = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
          cachedContent: roomData.cacheAI,
        },
      });

      if (respMensaje) {
        const contentAI = [...roomData.history,
          {
            role: "user",
            parts: [{text: prompt}],
          },
          {
            role: "model",
            parts: [{text: respMensaje.text}],
          }];

        const aiCache = await genAI.caches.create({
          model: "gemini-2.5-flash",
          config: {
            displayName: `Game: ${roomId}[${roomData.history.length + 1}]`,
            contents: contentAI,
            ttl: "3600s",
          },
        });

        const respuestaAI = respMensaje.text ?
          JSON.parse(respMensaje.text) :
          {};
        console.log("Mensajes AI:", respuestaAI);
        const privados = [
          ...roomData.privados,
          ...(tipo === "privado" ?
            [{sender: userName, mensaje, participante: userName}] :
            []),
          ...(respuestaAI.privados ?
            respuestaAI.privados.map((item: {
              mensaje: string,
              participante: string;
            }) => {
              return {...item, sender: "GM"};
            }) :
            []),
        ];
        console.log("Privados:", privados);
        const publicos = [
          ...roomData.publicos,
          ...(respuestaAI.publicos ?
            respuestaAI.publicos.map((item: {
              mensaje: string,
              participante: string;
            }) => {
              return {...item, sender: "GM"};
            }) :
            []),
        ];
        console.log("Publicos:", publicos);
        const eventos = [
          ...roomData.eventos,
          ...(respuestaAI.eventos ? [...respuestaAI.eventos] : []),
        ];
        console.log("Eventos:", eventos);

        const oldCacheName = roomData.cacheAI;
        transaction.update(roomRef, {
          privados,
          publicos,
          eventos,
          acciones: respuestaAI.acciones,
          personajes: respuestaAI.personajes,
          cacheAI: aiCache.name,
          history: contentAI,
        });
        genAI.caches.delete({name: oldCacheName});
        console.log("Room updated successfully.");
      } else {
        console.error("No game AI response received.");
      }
      // }
    });
  });

export {empezarJuego, enviarMensaje};

