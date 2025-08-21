import {onTaskDispatched} from "firebase-functions/tasks";
import {genAI} from "..";
import {getFirestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {getPrompt, promptCreateScenario, systemInstruction} from "./prompts";
import {scenarioSchema} from "../schemas/scenarioSchema";
import {getFunctions} from "firebase-admin/functions";

export const createScenarioTask = onTaskDispatched({
  secrets: ["GOOGLE_GENAI_API_KEY"],
}, async (task) => {
  try {
    const {roomId, gameId, historyChat} = task.data;
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);

    const scenarioChat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: historyChat,
    });

    const promptScenario = getPrompt(promptCreateScenario);
    const respScenario = await scenarioChat.sendMessage({
      message: promptScenario,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.5,
        candidateCount: 1,
        systemInstruction,
      },
    });

    if (respScenario) {
      historyChat.push({
        role: "user",
        parts: [{text: promptScenario}],
      });
      historyChat.push({
        role: "model",
        parts: [{text: respScenario.text}],
      });

      const scenario = respScenario.text ? JSON.parse(respScenario.text) : {};
      const scenarioRef = await firestore
        .collection(`games/${gameId}/scenarios`)
        .add({...scenario, historyChat});
      const scenarioId = scenarioRef.id;
      await roomRef.update({
        scenario: scenarioRef,
        status: "startingGame",
      });

      const queue = getFunctions().taskQueue("startGameTask");
      await queue.enqueue({roomId, gameId, scenarioId, historyChat});
    } else {
      throw new Error("No created scenario response received.");
    }
  } catch (error) {
    // Avoid retry?
    logger.error(error);
  }
});
