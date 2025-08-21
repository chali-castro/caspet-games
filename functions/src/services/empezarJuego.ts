import {getFirestore} from "firebase-admin/firestore";
import {getFunctions} from "firebase-admin/functions";
import {onCall} from "firebase-functions/v2/https";

export const empezarJuego = onCall({
  secrets: ["GOOGLE_GENAI_API_KEY"],
  enforceAppCheck: true,
}, async (request) => {
  const {roomId} = request.data;
  const firestore = getFirestore();

  const roomRef = firestore.doc(`rooms/${roomId}`);
  roomRef.update({
    status: "creatingGame",
  });

  const queue = getFunctions().taskQueue("createGameTask");
  await queue.enqueue({roomId});
});

