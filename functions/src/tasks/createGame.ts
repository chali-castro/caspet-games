import {getFirestore} from "firebase-admin/firestore";
import {onTaskDispatched} from "firebase-functions/tasks";
import {genAI} from "..";
import {getPrompt, promptCreateGame, systemInstruction} from "./prompts";
import {gameSchema} from "../schemas/gameSchema";
import {logger} from "firebase-functions";
import {getFunctions} from "firebase-admin/functions";

// const preparaPrompt = async (roomSnap: DocumentSnapshot) => {
//   if (!roomSnap.exists) {
//     throw new Error(`Room with ID ${roomSnap.id} does not exist.`);
//   }
//   const roomData = roomSnap.data();
//   const tipo = roomData?.tipo;
//   const bots = roomData?.bots ?? 0;
//   const players = await Promise.all(roomData?.players.map(
//     async (item: DocumentReference) => {
//       const participante = (await item.get()).data();
//       return participante !== undefined ? participante.name : "";
//     }));

//   const notDiceSentence = `
// - The actions will not depend \
// on the roll of the dice.\n`;
//   const rollDiceSentence1 = `
// - Some actions will require dice rolls to be made, \
// which will affect the result of the action.\n`;
//   const rollDiceSentence2 = `
// - Actions involving dice rolling must specify the conditions of \
// success and failure; if they involve significant risk or reward, \
// the conditions of resounding success and/or resounding failure are added.\n`;

//   const prompt = `
// Create a ${tipo} game with ${players.length + bots} players.\n
// The participants are: ${players.join(", ")}${
//   bots > 0 ? ` and ${bots} bots` : ""
// }.\n
// With the following characteristics:\n
// - You will be the GM and interact with the players \
// through public and private messages and events.\n
// ${
//   bots > 0 ? `- You will also control ${bots} bots.` : ""
// }
// ${roomData?.userCharacteristics ? roomData?.userCharacteristics : ""}
// - Lists the characters including NPCs (non-player characters), \
// their types and a brief history of each one.\n
// - Lists the locations (rooms, places, paths, etc.) if they exist, \
// with a brief description.\n
// - In public messages, you must send details such as: the rules, \
// welcome messages, general information, objectives, \
// the occurrence of events.\n
// - In private messages, you must send details such as: detailed, \
// sensitive or specific information for each player, \
// such as their role, abilities, personal goals, \
// and the actions they can take.\n
// - All messages must be in HTML format to be embedded in a DIV tag.\n
// - Each player has a number of actions available to use, \
// some of which may be common to some or all players.\n
// - The result of using actions depends on the game conditions.\n
// ${(roomData?.useDice ?? false) ? rollDiceSentence1 : notDiceSentence}
// - Some actions with a target must include a list of available targets \
// (characters, objects, weapons, locations, etc.) for use. \
// These targets will be stored in the 'targets' field. \
// Each target may also have a list of additional targets, \
// which will be stored in the 'secondTargets' field.
// - I need a format to convert the action into a correct sentence, \
// for example:\n
// \`\`\`
// actions: [{
//   {
//     name: "Rest",
//     format: "\${action}"
//   },
//   {
//     name: "Move",
//     targets: [
//       { name: "north" },
//       { name: "south" }
//     ],
//     format: "\${action} to \${target}"
//   },
//   {
//     name: "Attack",
//     targets: [
//       {
//         name: "sword",
//         secondTargets: ["Gnomo Jaxier", "King Arthur"]
//       },
//       {
//         name: "arrow bow",
//         secondTargets: ["Elfo Legolas", "Reina Arwen"]
//       }
//     ],
//     formato: "\${action} with \${target} to \${secondTarget}"
//   }
// ]
// \`\`\`
// ${(roomData?.useDice ?? false) === true ? rollDiceSentence2 : ""}
// - After an action is executed, \
// you must update the actions that can be performed.\n
// - The game must consist of ${roomData?.rounds ?? 10} rounds\n
// - The players can take ${roomData?.actionsPerRound ?? 1} actions per round.
// - Rounds end when all players have completed their actions.
// - At the end of the round the player's status and the events \
// that occurred must be reported via messages.\n
// The answer must be in Spanish.`;

//   return prompt;
// };


export const createGameTask = onTaskDispatched({
  secrets: ["GOOGLE_GENAI_API_KEY"],
}, async (task) => {
  try {
    const {roomId} = task.data;
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);
    let gameId: string;
    const createChat = genAI.chats.create({
      model: "gemini-2.5-flash",
    });

    const promptCreate = getPrompt(promptCreateGame);
    const respCreate = await createChat.sendMessage({
      message: promptCreate,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
        temperature: 0.5,
        candidateCount: 1,
        systemInstruction,
      },
    });

    if (respCreate) {
      const historyChat = [{
        role: "user",
        parts: [{text: promptCreate}],
      }, {
        role: "model",
        parts: [{text: respCreate.text}],
      }];

      const game = respCreate.text ? JSON.parse(respCreate.text) : {};
      const gameRef = await firestore
        .collection("games")
        .add({...game, historyChat});
      gameId = gameRef.id;
      await roomRef.update({
        game: gameRef,
        status: "creatingScenario",
      });

      const queue = getFunctions().taskQueue("createScenarioTask");
      await queue.enqueue({roomId, gameId, historyChat});
    } else {
      throw new Error("No created game response received.");
    }
  } catch (error) {
    // Avoid retry?
    logger.error(error);
  }
});

