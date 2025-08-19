import {DocumentReference, DocumentSnapshot, getFirestore}
  from "firebase-admin/firestore";
import {onTaskDispatched} from "firebase-functions/tasks";
import {genAI} from "..";
import {stepSchema} from "../models/stepSchema";

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const preparaPrompt = async (roomSnap: DocumentSnapshot) => {
  if (!roomSnap.exists) {
    throw new Error(`Room with ID ${roomSnap.id} does not exist.`);
  }
  const roomData = roomSnap.data();
  const tipo = roomData?.tipo;
  const bots = roomData?.bots ?? 0;
  const players = await Promise.all(roomData?.players.map(
    async (item: DocumentReference) => {
      const participante = (await item.get()).data();
      return participante !== undefined ? participante.name : "";
    }));

  const rollDiceSentence1 = `
- Some actions will require dice rolls to be made, \
which will affect the result of the action.\n`;
  const rollDiceSentence2 = `
- Actions involving dice rolling must specify the conditions of \
success and failure; if they involve significant risk or reward, \
the conditions of resounding success and/or resounding failure are added.\n`;

  const prompt = `
Create a ${tipo} game with ${players.length + bots} players.\n
The participants are: ${players.join(", ")}${
  bots > 0 ? ` and ${bots} bots` : ""
}.\n
With the following characteristics:\n
- You will be the GM and interact with the players \
through public and private messages and events.\n
${
  bots > 0 ? `- You will also control ${bots} bots.` : ""
}
${roomData?.userCharacteristics ? roomData?.userCharacteristics : ""}
- Lists the characters including NPCs (non-player characters), \
their types and a brief history of each one.\n
- Lists the locations (rooms, places, paths, etc.) if they exist, \
with a brief description.\n
- In public messages, you must send details such as: the rules, \
welcome messages, general information, objectives, \
the occurrence of events.\n
- In private messages, you must send details such as: detailed, \
sensitive or specific information for each player, \
such as their role, abilities, personal goals, and the actions they can take.\n
- All messages must be in HTML format to be embedded in a DIV tag.\n
- Each player has a number of actions available to use, \
some of which may be common to some or all players.\n
- The result of using actions depends on the game conditions.\n
${(roomData?.useDice ?? false) === true ? rollDiceSentence1 : ""}
- Some actions with a target must include a list of available targets \
(characters, objects, weapons, locations, etc.) for use. \
These targets will be stored in the 'targets' field. \
Each target may also have a list of additional targets, \
which will be stored in the 'secondTargets' field.
- I need a format to convert the action into a correct sentence, for example:\n
\`\`\`
actions: [{
  {
    name: "Rest", 
    format: "\${action}"
  },
  {
    name: "Move",
    targets: [
      { name: "north" },
      { name: "south" }
    ],
    format: "\${action} to \${target}"
  },
  {
    name: "Attack",
    targets: [
      {
        name: "sword", 
        secondTargets: ["Gnomo Jaxier", "King Arthur"]
      },
      {
        name: "arrow bow",
        secondTargets: ["Elfo Legolas", "Reina Arwen"]
      }
    ],
    formato: "\${action} with \${target} to \${secondTarget}" 
  }
]
\`\`\`
${(roomData?.useDice ?? false) === true ? rollDiceSentence2 : ""}
- After an action is executed, \
you must update the actions that can be performed.\n
- The game must consist of ${roomData?.rounds ?? 10} rounds\n
- The players can take ${roomData?.actionsPerRound ?? 1} actions per round.
- Rounds end when all players have completed their actions.
- At the end of the round the player's status and the events \
that occurred must be reported via messages.\n
The answer must be in Spanish.`;

  return prompt;
};

const crearJuegoTask = onTaskDispatched(async (task) => {
  const firestore = getFirestore();

  await firestore.runTransaction(async (transaction) => {
    const roomRef = firestore.doc(`rooms/${task.data.roomId}`);
    const roomSnap = await transaction.get(roomRef);

    const prompt = await preparaPrompt(roomSnap);

    const chatAI = genAI.chats.create({
      model: "gemini-2.5-flash",
    });

    const respGameAI = await chatAI.sendMessage({
      message: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: stepSchema,
        temperature: 2,
        candidateCount: 1,
      },
    });

    if (respGameAI) {
      const contentAI = [{
        role: "user",
        parts: [{text: prompt}],
      },
      {
        role: "model",
        parts: [{text: respGameAI.text}],
      },
      ];

      const gameAI = respGameAI.text ? JSON.parse(respGameAI.text) : {};

      const publics = gameAI.publics != null ? gameAI.publics.map(
        (item: { message: string; }) => {
          return {...item, sender: "GM"};
        }) : [];
      const privates = gameAI.privates != null ? gameAI.privates.map(
        (item: { message: string, player: string; }) => {
          return {...item, sender: "GM"};
        }) : [];

      transaction.update(roomRef, {
        gameName: gameAI.name,
        publics,
        privates,
        events: gameAI.events ?? [],
        actions: gameAI.actions ?? [],
        characters: gameAI.characters ?? [],
        locations: gameAI.locations ?? [],
        history: contentAI,
        status: "progress",
      });
    } else {
      console.error("No game AI response received.");
    }
  });
});

const userActionTask = onTaskDispatched(async (task) => {
  const {roomId, userName, typeMsg, message, diceRolls} = task.data;
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
${userName} sends you a ${typeMsg}: '${message}' \
${diceRolls !== null ?
    `with the following dice rolls: ${JSON.stringify(diceRolls)}.` :
    ""}.\n
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
        ...(typeMsg === "private" ?
          [{sender: userName, message, player: userName}] :
          []),
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

      transaction.update(roomRef, {
        privates,
        publics,
        events,
        actions: respuestaAI.actions,
        characters: respuestaAI.characters,
        locations: respuestaAI.locations,
        history: contentAI,
        status: "progress",
      });
    } else {
      console.error("No game AI response received.");
    }
    // }
  });
});

export {crearJuegoTask, userActionTask};
