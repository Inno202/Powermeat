import { initializeApp } from 'firebase/app';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/* Powermeat's Firebase project. These values identify the project; they are not
   secrets and are meant to be in the website. Access to the data is controlled by
   firestore.rules, which are enforced by Google's servers. */
export const firebaseConfig = {
  apiKey: 'AIzaSyDFVm8kKX-Lc2ht34fDu329TQw388uRYUM',
  authDomain: 'powermeat-8e3ff.firebaseapp.com',
  projectId: 'powermeat-8e3ff',
  storageBucket: 'powermeat-8e3ff.firebasestorage.app',
  messagingSenderId: '1097198198969',
  appId: '1:1097198198969:web:f9c3659dfd7a78b9a8bb68'
};

/** Local testing against the Firebase emulators instead of the live project. */
export const USE_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';

export const firebaseApp = initializeApp(
  USE_EMULATORS ? { ...firebaseConfig, projectId: 'demo-powermeat' } : firebaseConfig
);
export const db = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
export const auth = getAuth(firebaseApp);

if (USE_EMULATORS) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
