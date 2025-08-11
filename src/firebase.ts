import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { CustomProvider, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBAEY1A0LdMApdG5elnFWIl3lIBVhuJVYw",
  authDomain: "caspet-games.firebaseapp.com",
  projectId: "caspet-games",
  storageBucket: "caspet-games.firebasestorage.app",
  messagingSenderId: "57585583550",
  appId: "1:57585583550:web:a726c617bfe3cf7a5ba5ef",
  measurementId: "G-YL2ZM3CEPN"
};


const firebaseApp = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
setPersistence(auth, browserSessionPersistence);

if (import.meta.env.MODE === 'development') {
  console.log('development, process.env: ' + JSON.stringify(import.meta.env));
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

  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  connectFunctionsEmulator(getFunctions(), '127.0.0.1', 5001);
} else {
  console.log('production, process.env: ' + JSON.stringify(import.meta.env));
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}