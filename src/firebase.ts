import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbSettings = {
  experimentalAutoDetectLongPolling: true
};

// Specify custom databaseId if provided in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? initializeFirestore(app, dbSettings, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, dbSettings);

export const auth = getAuth(app);
export default app;
