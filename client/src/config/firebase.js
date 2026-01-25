import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration - Updated for Stratix-AI project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbG3EPU0STqoFxrt3TLL7r07wKZXuGkzA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "stratix-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "stratix-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "stratix-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "349488126851",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:349488126851:web:4ec922eb268fa1024934b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F1NC7ZWPDW"
}

// Initialize Firebase
let app
let auth
let db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Create fallback objects to prevent crashes
  app = null
  auth = null
  db = null
}

export { auth, db }
export default app
