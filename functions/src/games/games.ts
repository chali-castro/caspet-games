import {DocumentReference, DocumentSnapshot, getFirestore}
  from "firebase-admin/firestore";
import {runWith} from "firebase-functions/v1";
import {genAI} from "..";
import {Type} from "@google/genai";

const gameSchema = {
  type: Type.OBJECT,
  properties: {
    name: {type: Type.STRING},
    privates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          player: {type: Type.STRING},
          message: {type: Type.STRING},
        },
        required: ["player", "message"],
      },
    },
    publics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          message: {type: Type.STRING},
        },
        required: ["message"],
      },
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          description: {type: Type.STRING},
          format: {type: Type.STRING},
          targets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {type: Type.STRING},
                secondTargets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: ["name"],
            },
          },
          players: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          dice: {
            type: Type.OBJECT,
            properties: {
              type: {type: Type.STRING},
              amount: {type: Type.NUMBER},
              successConditions: {type: Type.STRING},
              effects: {type: Type.STRING},
            },
            required: ["type", "amount", "effects"],
          },
        },
        required: ["name", "description", "format", "players"],
      },
    },
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          type: {type: Type.STRING},
          history: {type: Type.STRING},
        },
        required: ["name", "type", "history"],
      },
    },
    locations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          type: {type: Type.STRING},
          details: {type: Type.STRING},
        },
        required: ["name", "type", "details"],
      },
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: {type: Type.STRING},
          explanation: {type: Type.STRING},
        },
        required: ["description"],
      },
    },
    progressPercentage: {type: Type.NUMBER},
  },
  required: ["name", "progressPercentage"],
};

const preparaPrompt = async (roomSnap: DocumentSnapshot) => {
  if (!roomSnap.exists) {
    throw new Error(`Room with ID ${roomSnap.id} does not exist.`);
  }
  const roomData = roomSnap.data();
  const tipo = roomData?.tipo;
  const players = await Promise.all(roomData?.players.map(
    async (item: DocumentReference) => {
      const participante = (await item.get()).data();
      return participante !== undefined ? participante.name : "";
    }));

  const prompt = `
Create a ${tipo} game with ${players.length} players.\n
The participants are: ${players.join(", ")}.\n
With the following characteristics:\n
- You will be the GM and interact with the players \
through public and private messages and events.\n
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
- Some actions will require dice rolls to be made, \
which will affect the result of the action.\n
- Some actions with a target must include a list of available targets \
(characters, objects, locations, etc.) for use. \
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
- Actions involving dice rolling must specify the conditions of \
success and failure; if they involve significant risk or reward, \
the conditions of resounding success and/or resounding failure are added.\n
- After an action is executed, \
you must update the actions that can be performed.\n
- The game must consist of ${roomData?.rounds} rounds\n
- The players can take ${roomData?.actionsPerRound} actions per round.
- Rounds end when all players have completed their actions.
- At the end of the round the player's status and the events \
that occurred must be reported via private or public messages.\n
The answer must be in Spanish.`;

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

    await firestore.runTransaction(async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      const prompt = await preparaPrompt(roomSnap);

      const respGameAI = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
          temperature: 0.5,
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

        const publics = gameAI.publics.map((item: { message: string; }) => {
          return {...item, sender: "GM"};
        });
        const privates = gameAI.privates.map((item:
          {
            message: string,
            player: string;
          }) => {
          return {...item, sender: "GM"};
        });

        transaction.update(roomRef, {
          gameName: gameAI.name,
          publics,
          privates,
          events: gameAI.events,
          actions: gameAI.actions,
          characters: gameAI.characters,
          locations: gameAI.locations,
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
  .onCall(async ({roomId, userName, typeMsg, message, diceRolls}) => {
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
      const respMensaje = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gameSchema,
          cachedContent: roomData.cacheAI,
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

        const oldCacheName = roomData.cacheAI;
        transaction.update(roomRef, {
          privates,
          publics,
          events,
          actions: respuestaAI.actions,
          characters: respuestaAI.characters,
          locations: respuestaAI.locations,
          cacheAI: aiCache.name,
          history: contentAI,
        });
        genAI.caches.delete({name: oldCacheName});
      } else {
        console.error("No game AI response received.");
      }
      // }
    });
  });

export {empezarJuego, enviarMensaje};

