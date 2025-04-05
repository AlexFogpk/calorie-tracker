// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Removed getAnalytics import
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Отладочный вывод для проверки значений
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9nF1YnqwQrCk1-XKEie7TcdmngHBkA2s",
  authDomain: "this-is-ai-fitness-bot.firebaseapp.com",
  projectId: "this-is-ai-fitness-bot",
  storageBucket: "this-is-ai-fitness-bot.firebasestorage.app",
  messagingSenderId: "22907461879",
  appId: "1:22907461879:web:6ec99a9b7509d1a677f3f2",
  measurementId: "G-MY1WEX04L6"
};

// Проверяем, что все необходимые значения присутствуют
const missingConfig = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error('Missing Firebase configuration:', missingConfig);
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services we need
const auth = getAuth(app);
const db = getFirestore(app);

// Removed Analytics initialization
// const analytics = getAnalytics(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Export the services for use in other components
export { auth, db };