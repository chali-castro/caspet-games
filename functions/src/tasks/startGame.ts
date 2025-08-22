import {onTaskDispatched} from "firebase-functions/tasks";
import {genAI} from "..";
import {getFirestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {getPrompt, promptStartGame, systemInstruction} from "./prompts";
import {gameStateSchema} from "caspet-games-model";

export const startGameTask = onTaskDispatched({
  secrets: ["GOOGLE_GENAI_API_KEY"],
}, async (task) => {
  try {
    const {roomId, historyChat} = task.data;
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);

    const startGameChat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: historyChat,
    });

    const promptStart = getPrompt(promptStartGame);
    const respStart = await startGameChat.sendMessage({
      message: promptStart,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameStateSchema,
        temperature: 0.5,
        candidateCount: 1,
        systemInstruction,
      },
    });

    if (respStart) {
      historyChat.push({
        role: "user",
        parts: [{text: promptStart}],
      });
      historyChat.push({
        role: "model",
        parts: [{text: respStart.text}],
      });

      const gameState = respStart.text ? JSON.parse(respStart.text) : {};
      const gameStateRef = await firestore
        .collection(`rooms/${roomId}/playGames`)
        .add({...gameState, historyChat});
      await roomRef.update({
        currentGame: gameStateRef,
        status: "progress",
      });
    } else {
      throw new Error("No created scenario response received.");
    }
  } catch (error) {
    // Avoid retry?
    logger.error(error);
  }
});
