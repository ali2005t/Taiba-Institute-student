import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Get config from injected global __firebase_config (production/sandbox)
let config = {};

// 1. Get config from injected global __firebase_config (production/sandbox)
if (typeof __firebase_config !== 'undefined') {
  try {
    const parsedConfig = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
    if (parsedConfig && parsedConfig.apiKey) {
      config = parsedConfig;
    }
  } catch (e) {
    console.error("Failed to parse __firebase_config global:", e);
  }
}

// 2. Fallback to Vite environment variables for local development (.env)
if (!config.apiKey && import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    const parsedConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    if (parsedConfig && parsedConfig.apiKey) {
      config = parsedConfig;
    }
  } catch (e) {
    console.error("Failed to parse VITE_FIREBASE_CONFIG env variable:", e);
  }
}

// 3. Fallback to individual Vite environment variables
if (!config.apiKey && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
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
    "⚠️ Firebase configuration was not found in environment variables! Using fallback configuration."
  );

  // Use actual configuration as fallback if env variables are missing during build
  config = {
    apiKey: "AIzaSyDESCa7MNP_h8aVNPDcv1eBJ7pJD8Pqm-M",
    authDomain: "thebe-institute.firebaseapp.com",
    projectId: "thebe-institute",
    storageBucket: "thebe-institute.firebasestorage.app",
    messagingSenderId: "818338205348",
    appId: "1:818338205348:web:0bccb60683a52d7917e031"
  };
}

export { config as firebaseConfig };
export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : (import.meta.env && import.meta.env.VITE_APP_ID ? import.meta.env.VITE_APP_ID : 'taiba-academy-app');

