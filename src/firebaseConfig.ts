// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Используем import.meta.env вместо process.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Отладочный вывод
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket ? 'set' : undefined,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : undefined,
  appId: firebaseConfig.appId ? 'set' : undefined,
  measurementId: firebaseConfig.measurementId ? 'set' : undefined
});

// Проверка, что всё есть
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error('Missing Firebase configuration:', missingConfig);
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Экспорт
export { app, analytics, db, auth };
