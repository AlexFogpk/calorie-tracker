import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserParams, User, NutritionGoals } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveUserData = async (uid: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, data, { merge: true }); 
      console.log("User data saved:", uid, data);
    } catch (err) {
      console.error("Error saving user data:", err);
      setError('Failed to save user data');
      throw err;
    }
  };

  const updateUserParams = async (params: UserParams) => {
    if (!user?.uid) {
      setError("User not authenticated to update params.");
      return;
    }
    try {
      await saveUserData(user.uid, { params });
      setUser(prev => prev ? { ...prev, params } : null);
    } catch (err) {
      setError('Failed to update user parameters');
      throw err;
    }
  };

  const updateUserGoals = async (goals: NutritionGoals) => {
    if (!user?.uid) {
      setError("User not authenticated to update goals.");
      return;
    }
    try {
      await saveUserData(user.uid, { goals }); 
      setUser(prev => prev ? { ...prev, goals } : null);
    } catch (err) {
      setError('Failed to update user goals');
      throw err;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          let currentUser: User | null = null;
          try {
            if (!firebaseUser) {
              console.log('Выполняем анонимный вход...');
              const credential = await signInAnonymously(auth);
              console.log('Анонимный вход успешен:', credential.user.uid);
              currentUser = { uid: credential.user.uid };
              await saveUserData(currentUser.uid, { uid: currentUser.uid }); 
            } else {
              console.log('Пользователь аутентифицирован:', firebaseUser.uid);
              const userRef = doc(db, "users", firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                console.log("User data loaded from Firestore:", userSnap.data());
                currentUser = { uid: firebaseUser.uid, ...userSnap.data() } as User;
              } else {
                console.log("No user data found in Firestore, creating initial record.");
                currentUser = { uid: firebaseUser.uid };
                await saveUserData(currentUser.uid, { uid: currentUser.uid }); 
              }
            }
            setUser(currentUser);
          } catch (error) {
            console.error('Ошибка аутентификации или загрузки данных:', error);
            setError(error instanceof Error ? error.message : 'Ошибка аутентификации/загрузки данных');
            setUser(null);
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Ошибка инициализации аутентификации:', error);
        setError(error instanceof Error ? error.message : 'Ошибка инициализации аутентификации');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, loading, error, updateUserParams, updateUserGoals };
}; 