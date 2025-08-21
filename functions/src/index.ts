import {onInit, params, setGlobalOptions} from "firebase-functions";
import {GoogleGenAI} from "@google/genai";
import * as admin from "firebase-admin";

import {empezarJuego} from "./services/empezarJuego";
import {enviarMensaje} from "./services/enviarMensaje";
import {createGameTask} from "./tasks/createGame";
import {createScenarioTask} from "./tasks/createScenario";
import {startGameTask} from "./tasks/startGame";
import {userActionTask} from "./tasks/userAction";

admin.initializeApp();

export let genAI: GoogleGenAI;

setGlobalOptions({maxInstances: 10});
onInit(async () => {
  const apiKey = params.defineSecret("GOOGLE_GENAI_API_KEY");
  genAI = new GoogleGenAI({apiKey: apiKey.value()});
});


exports.empezarJuego = empezarJuego;
exports.enviarMensaje = enviarMensaje;
exports.createGameTask = createGameTask;
exports.createScenarioTask = createScenarioTask;
exports.startGameTask = startGameTask;
exports.userActionTask = userActionTask;
