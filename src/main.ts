import { createApp } from 'vue';
import App from './App.vue'
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
//import { GoogleGenAI } from "@google/genai";

import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import './style.css'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyBAEY1A0LdMApdG5elnFWIl3lIBVhuJVYw",
    authDomain: "caspet-games.firebaseapp.com",
    projectId: "caspet-games",
    storageBucket: "caspet-games.firebasestorage.app",
    messagingSenderId: "57585583550",
    appId: "1:57585583550:web:a726c617bfe3cf7a5ba5ef",
    measurementId: "G-YL2ZM3CEPN"
};

// console.log('process.env: ' + import.meta.env.VITE_GEMINI_API_KEY);
// const ai = new GoogleGenAI({
//     apiKey: import.meta.env.VITE_GEMINI_API_KEY,
//   });

// async function testAI() {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: "Quiero un juego social de misterio con habitaciones para 5 participantes: Juan, Pedro, Elias, Pilar y Eva donde tú seras el GM e interactuaras con los jugadores",
//     });
//     console.log('IA Response: ' + response.text);
//   }
  
//   testAI();

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
console.log('Forebase init...');

if (import.meta.env.MODE === 'development') {
  console.log('Development mode');
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  connectFunctionsEmulator(getFunctions(), '127.0.0.1', 5001);
}

const vuetify = createVuetify();

createApp(App).use(vuetify).mount('#app');
