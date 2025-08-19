import {getFirestore} from "firebase-admin/firestore";
import {getFunctions} from "firebase-admin/functions";
import {onCall} from "firebase-functions/v2/https";


const empezarJuego = onCall({
  secrets: ["GOOGLE_GENAI_API_KEY"],
  enforceAppCheck: true,
}, async (request) => {
  const {roomId} = request.data;
  const firestore = getFirestore();

  const roomRef = firestore.doc(`rooms/${roomId}`);
  roomRef.update({
    status: "creating",
  });

  const queue = getFunctions().taskQueue("crearJuegoTask");
  await queue.enqueue({roomId});
});

const enviarMensaje = onCall({
  secrets: ["GOOGLE_GENAI_API_KEY"],
  enforceAppCheck: true,
}, async (request) => {
  const {roomId, userName, typeMsg, message, diceRolls} = request.data;
  // const firestore = getFirestore();

  // const roomRef = firestore.doc(`rooms/${roomId}`);
  // roomRef.update({
  //   status: "acting",
  // });
  const queue = getFunctions().taskQueue("userActionTask");
  await queue.enqueue({roomId, userName, typeMsg, message, diceRolls});
});

export {empezarJuego, enviarMensaje};

