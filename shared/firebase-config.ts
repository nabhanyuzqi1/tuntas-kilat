import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyC7X8Z9Q2X3Y4Z5A6B7C8D9E0F1G2H3I4J5",
  authDomain: "tuntas-kilat.firebaseapp.com",
  projectId: "tuntas-kilat",
  storageBucket: "tuntas-kilat.firebasestorage.app",
  messagingSenderId: "207819547242",
  appId: "1:207819547242:web:5ed77fd539443b20f5a013",
  measurementId: "G-W1E4ZZ5S7C",
  databaseURL: "https://tuntas-kilat-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

// Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Connect to emulators in development
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  try {
    // Check if emulator is already connected by testing projectId
    const projectId = db.app.options.projectId;
    if (!projectId?.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log('Firestore emulator connection skipped');
  }
}

export default app;