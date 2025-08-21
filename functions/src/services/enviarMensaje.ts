import {getFirestore} from "firebase-admin/firestore";
import {getFunctions} from "firebase-admin/functions";
import {onCall} from "firebase-functions/v2/https";

export const enviarMensaje = onCall({
  secrets: ["GOOGLE_GENAI_API_KEY"],
  enforceAppCheck: true,
}, async (request) => {
  const {roomId, userName, typeMsg, message, diceRolls} = request.data;

  if (typeMsg === "private") {
    const firestore = getFirestore();
    const roomRef = firestore.doc(`rooms/${roomId}`);
    let {privates, pendingMessages} = (await roomRef.get()).data() as {
      privates?: {message:string, sender: string, player:string}[],
      pendingMessages?: {
        roomId: string;
        userName: string;
        typeMsg: string;
        message: string;
        diceRolls?: number[];
  } [];
    };

    privates = [
      ...(privates ?? []),
      {sender: userName, message, player: userName},
    ];
    pendingMessages = [
      ...(pendingMessages ?? []),
      {roomId, userName, typeMsg, message, diceRolls},
    ];

    roomRef.update({
      privates,
      pendingMessages,
    });

    const queue = getFunctions().taskQueue("userActionTask");
    await queue.enqueue({roomId});
  }
});
