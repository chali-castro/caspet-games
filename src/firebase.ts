import { initializeApp } from 'firebase/app';
import { CustomProvider, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
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

export const firebaseApp = initializeApp(firebaseConfig);

if (import.meta.env.MODE === 'development') {
  initializeAppCheck(firebaseApp, {
    provider: new CustomProvider({
      getToken: () =>
      {
        return Promise.resolve({
          token: "fake-token",
          expireTimeMillis: Date.now() + 1000 * 60 * 60 * 24, // 1 day
        });
      }
    }),

    isTokenAutoRefreshEnabled: true,
  });

  connectAuthEmulator(getAuth(firebaseApp), 'http://127.0.0.1:9099');
  connectFunctionsEmulator(getFunctions(), '127.0.0.1', 5001);
} else {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}