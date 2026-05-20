import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Get config from injected global __firebase_config (production/sandbox)
let config = {};

if (typeof __firebase_config !== 'undefined') {
  try {
    config = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
  } catch (e) {
    console.error("Failed to parse __firebase_config global:", e);
  }
}
// 2. Fallback to Vite environment variables for local development (.env)
else if (import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    config = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  } catch (e) {
    console.error("Failed to parse VITE_FIREBASE_CONFIG env variable:", e);
  }
}
// 3. Fallback to individual Vite environment variables
else if (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
  config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

// Validate if config has required keys
const hasValidConfig = config && config.apiKey;

if (!hasValidConfig) {
  console.warn(
    "⚠️ Firebase configuration is missing! Local development requires a .env file.\n" +
    "Please create a .env file in the root directory with your Firebase config.\n" +
    "Example:\n" +
    "VITE_FIREBASE_API_KEY=your-api-key\n" +
    "VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain\n" +
    "...\n" +
    "Or:\n" +
    "VITE_FIREBASE_CONFIG={\"apiKey\":\"...\",\"authDomain\":\"...\",...}"
  );

  // Use a placeholder config to prevent immediate initialization crash on local startup.
  config = {
    apiKey: "placeholder-api-key-for-local-development",
    authDomain: "placeholder-auth-domain",
    projectId: "placeholder-project-id",
    storageBucket: "placeholder-storage-bucket",
    messagingSenderId: "placeholder-messaging-sender-id",
    appId: "placeholder-app-id"
  };
}

export { config as firebaseConfig };
export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : (import.meta.env && import.meta.env.VITE_APP_ID ? import.meta.env.VITE_APP_ID : 'taiba-academy-app');

