import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO123456",
  databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://demo-project-rtdb.firebaseio.com/"
};

// Check if we're in development mode with valid Firebase config
const isDevelopment = import.meta.env?.DEV;
const hasValidFirebaseConfig = firebaseConfig.apiKey !== "demo-api-key";

let app: any = null;
let isFirebaseEnabled = false;

try {
  if (hasValidFirebaseConfig) {
    // Initialize Firebase only if we have valid config
    app = initializeApp(firebaseConfig);
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase not initialized - using demo mode');
  }
} catch (error) {
  console.log('Firebase initialization failed, using demo mode:', error);
  isFirebaseEnabled = false;
}

// Firebase services - with fallbacks for demo mode
export const db = isFirebaseEnabled && app ? getFirestore(app) : null;
export const auth = isFirebaseEnabled && app ? getAuth(app) : null;
export const storage = isFirebaseEnabled && app ? getStorage(app) : null;
export const realtimeDb = isFirebaseEnabled && app ? getDatabase(app) : null;

// Analytics (only in browser and when Firebase is enabled)
export const analytics = (isFirebaseEnabled && app && typeof window !== 'undefined') 
  ? (() => {
      try {
        return getAnalytics(app);
      } catch (error) {
        console.log('Analytics initialization failed:', error);
        return null;
      }
    })()
  : null;

// Export Firebase availability status
export const isFirebaseAvailable = isFirebaseEnabled;

// Connect to emulators in development (only if Firebase is enabled)
if (isDevelopment && isFirebaseEnabled && db && typeof window !== 'undefined') {
  try {
    // Check if emulator is already connected by testing projectId
    const projectId = db.app.options.projectId;
    if (!projectId?.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log('Firestore emulator connection skipped:', error);
  }
}

export default app;