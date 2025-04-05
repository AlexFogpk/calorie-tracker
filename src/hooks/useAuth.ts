import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signInAnonymously, User, browserLocalPersistence, setPersistence } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Устанавливаем локальную персистентность
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            if (!user) {
              console.log('Выполняем анонимный вход...');
              const credential = await signInAnonymously(auth);
              console.log('Анонимный вход успешен:', credential.user.uid);
              setUser(credential.user);
            } else {
              console.log('Пользователь аутентифицирован:', user.uid);
              setUser(user);
            }
          } catch (error) {
            console.error('Ошибка аутентификации:', error);
            setError(error instanceof Error ? error.message : 'Ошибка аутентификации');
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

  return { user, loading, error };
}; 