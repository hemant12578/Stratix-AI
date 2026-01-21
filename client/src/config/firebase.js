import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA876uaMMOxUaF-T0IoYnpCx1Z_C_yy40g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dataforge-ai-fcfb1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dataforge-ai-fcfb1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dataforge-ai-fcfb1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "216173018359",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:216173018359:web:28e249f7916e94fe27a7f2"
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
