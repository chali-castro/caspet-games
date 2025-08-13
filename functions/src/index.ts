import express from "express";
import cors from "cors";
import {onInit, params, setGlobalOptions} from "firebase-functions";
import {GoogleGenAI} from "@google/genai";
import * as admin from "firebase-admin";

import {empezarJuego, enviarMensaje} from "./games/games";

admin.initializeApp();

if (process.env.FIREBASE_DEBUG_MODE === "true") {
  const appHost = express();
  appHost.use(cors({origin: "*"}));
}

export let genAI: GoogleGenAI;

setGlobalOptions({maxInstances: 10});
onInit(async () => {
  const apiKey = params.defineSecret("GOOGLE_GENAI_API_KEY");
  genAI = new GoogleGenAI({apiKey: apiKey.value()});
});


exports.empezarJuego = empezarJuego;
exports.enviarMensaje = enviarMensaje;
