// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Removed getAnalytics import
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Отладочный вывод для проверки значений
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket ? 'set' : undefined,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : undefined,
  appId: firebaseConfig.appId ? 'set' : undefined,
  measurementId: firebaseConfig.measurementId ? 'set' : undefined
});

// Проверяем, что все необходимые значения присутствуют
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId') // measurementId может отсутствовать
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
try {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Firebase persistence error:", error);
  });
} catch (error) {
  console.error("Firebase persistence setup failed:", error);
}

// Export the services for use in other components
export { auth, db };
