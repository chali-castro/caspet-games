import {getFirestore} from "firebase-admin/firestore";
import {onTaskDispatched} from "firebase-functions/tasks";
import {genAI} from "..";
import {stepSchema} from "../models/stepSchema";

export const userActionTask = onTaskDispatched({
  secrets: ["GOOGLE_GENAI_API_KEY"],
  concurrency: 1,
  retryConfig: {maxAttempts: 0},
}, async (task) => {
  const {roomId} = task.data;
  const firestore = getFirestore();
  const roomRef = firestore.doc(`rooms/${roomId}`);

  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) {
    throw new Error(`Room with ID ${roomId} does not exist.`);
  }
  const roomData = roomSnap.data();

  if (!roomData) {
    throw new Error(`No data found for room with ID ${roomId}.`);
  }

  if (roomData.pendingMessages?.length < roomData.players?.length) {
    return;
  }

  const mensajes = roomData.pendingMessages.map((item: {
    roomId: string,
    userName: string,
    typeMsg: string,
    message: string,
    diceRolls?: number[];
  }) => {
    let m = `${item.userName} sends you a ${item.typeMsg}: '${item.message}`;
    if (item.diceRolls != null) {
      m += `with the following dice rolls: ${JSON.stringify(item.diceRolls)}.`;
    }
    return m;
  });

  const prompt = `- ${(mensajes as string[]).join("\n")}\n
- Do not include previous public and private messages.\n
- Do not include previous events.\n
- Give me the result of the actions as private messages.
`;
  const chatAI = genAI.chats.create({
    model: "gemini-2.5-flash",
    history: roomData.history,
  });

  const respMensaje = await chatAI.sendMessage({
    message: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: stepSchema,
      temperature: 0.5,
      candidateCount: 1,
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

    const respuestaAI = respMensaje.text ?
      JSON.parse(respMensaje.text) :
      {};

    const privates = [
      ...roomData.privates,
      // ...(typeMsg === "private" ?
      //   [{sender: userName, message, player: userName}] :
      //   []),
      ...(respuestaAI.privates ?
        respuestaAI.privates.map((item: {
                        message: string,
                        player: string;
                    }) => {
          return {...item, sender: "GM"};
        }) :
        []),
    ];

    const publics = [
      ...roomData.publics,
      ...(respuestaAI.publics ?
        respuestaAI.publics.map((item: {
                        message: string,
                        player: string;
                    }) => {
          return {...item, sender: "GM"};
        }) :
        []),
    ];

    const events = [
      ...roomData.events,
      ...(respuestaAI.events ? [...respuestaAI.events] : []),
    ];

    roomRef.update({
      pendingMessages: [],
      privates,
      publics,
      events,
      actions: respuestaAI.actions,
      characters: respuestaAI.characters,
      locations: respuestaAI.locations,
      history: contentAI,
    });
  } else {
    console.error("No game AI response received.");
  }
  // }
});
