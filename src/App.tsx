import React, { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, orderBy, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from './firebaseConfig';
import { useAuth } from './hooks/useAuth';
import { FaUserCog, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import AppTitle from './components/AppTitle';
import WelcomeScreen from './components/WelcomeScreen';
import UserParameters from './components/UserParameters';
import AddMealScreen from './components/AddMealScreen';
import DailyMealLog from './components/DailyMealLog';
import DatePicker from './components/DatePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { Meal, MealCategory, MEAL_CATEGORIES, formatDate, NutritionData, UserProfile, UserParameters as UserParametersType } from './types';
import NutritionRings from './components/NutritionRings';
import EditMealScreen from './components/EditMealScreen';
import Calendar from './components/Calendar';
import { IoAddCircle } from 'react-icons/io5';
import { FiUser } from 'react-icons/fi';

// Function to format date more concisely for mobile
const formatMobileDate = (date: Date, locale: string = 'ru-RU'): string => {
  return date.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
};

type Screen = 'welcome' | 'parameters' | 'main' | 'add' | 'edit' | 'addMeal';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, error: authError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [dailyTotals, setDailyTotals] = useState<NutritionData>({ calories: 0, protein: 0, fat: 0, carbs: 0, weight: 0 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleWelcomeComplete = () => {
    console.log('Завершение приветствия');
    setCurrentScreen('parameters');
  };

  const handleParametersComplete = (updatedProfile?: UserProfile) => {
    console.log('Завершение настройки параметров');
    if (updatedProfile && Object.keys(updatedProfile).length > 0) {
      setUserProfile(updatedProfile);
      console.log('User profile updated locally:', updatedProfile);
    } else {
      // Optionally re-fetch profile if no data passed (e.g., user just closed the modal)
      // fetchUserProfile(); // Consider if re-fetching is needed on simple close
    }
    setCurrentScreen('main');
  };

  const handleAddMeal = () => {
    console.log('Клик по кнопке добавления приема пищи');
    setCurrentScreen('addMeal');
  };

  const handleAddMealClose = () => {
    console.log('Закрытие экрана добавления приема пищи');
    setCurrentScreen('main');
  };

  const handleParametersClick = () => {
    console.log('Клик по кнопке параметров');
    setCurrentScreen('parameters');
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserProfile = async () => {
      const docRef = doc(db, `users/${user.uid}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
        console.log("User profile loaded:", docSnap.data());
        const profileData = docSnap.data();
        if (!profileData.weight || !profileData.height || !profileData.age || !profileData.gender || !profileData.activityLevel || !profileData.goals) {
          if (!profileData.name) {
             setCurrentScreen('welcome');
          } else {
             setCurrentScreen('parameters');
          }
        } else {
           setCurrentScreen('main');
        }
      } else {
        console.log("No such document! Starting welcome screen.");
        setCurrentScreen('welcome');
      }
      setLoading(false);
    };

    fetchUserProfile().catch(err => {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile.");
      setLoading(false);
    });

  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const mealsCol = collection(db, `users/${user.uid}/meals`);
    const q = query(mealsCol,
                    where("timestamp", ">=", startOfDay),
                    where("timestamp", "<=", endOfDay),
                    orderBy("timestamp", "asc"));

    const unsubscribeMeals = onSnapshot(q, (querySnapshot) => {
      const fetchedMeals: Meal[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMeals.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as Meal);
      });
      setMeals(fetchedMeals);
      console.log('Meals fetched for', selectedDate.toLocaleDateString(), fetchedMeals);
    }, (error) => {
      console.error("Error fetching meals: ", error);
      setError("Failed to load meals.");
    });

    // Cleanup function for meal subscription
    return () => unsubscribeMeals();

  }, [user?.uid, selectedDate]);

  useEffect(() => {
    const totals = meals.reduce((acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.fat += meal.fat || 0;
      acc.carbs += meal.carbs || 0;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, weight: 0 });
    
    setDailyTotals(totals);
    console.log('Daily totals calculated:', totals);
  }, [meals]);

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (authError || error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {authError || error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
           <AppTitle />
        </div>
        <div className="flex flex-1 justify-end items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="text-gray-600 hover:text-blue-500 text-xl sm:text-2xl"
            aria-label={t('aria.toggleCalendar')}
          >
            <FaCalendarAlt />
          </button>
          <button
            onClick={handleParametersClick}
            className="text-gray-600 hover:text-blue-500 text-xl sm:text-2xl"
            aria-label={t('aria.userSettings')}
          >
            <FiUser />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-2 sm:right-4 bg-white p-2 sm:p-4 rounded-lg shadow-xl z-20"
          >
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setIsCalendarOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow p-4 overflow-y-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        {currentScreen === 'welcome' && (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        )}
        {currentScreen === 'parameters' && (
          <UserParameters
            onComplete={handleParametersComplete}
            initialData={userProfile ? {
              gender: userProfile.gender || 'male',
              age: userProfile.age || 30,
              height: userProfile.height || 170,
              weight: userProfile.weight || 70,
              activityLevel: userProfile.activityLevel || 'moderate',
              goal: userProfile.goal || 'maintenance'
            } : undefined}
          />
        )}
        {currentScreen === 'main' && (
          <>
            {userProfile?.goals && (
              <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center">{t('dashboard.progress')}</h2>
                <NutritionRings current={dailyTotals} goals={userProfile.goals} />
                <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2">
                   <span>{t('nutrition.calories')}: {userProfile.goals.calories.toFixed(0)} {t('unit.kcal')}</span>
                   <span>{t('nutrition.protein')}: {userProfile.goals.protein.toFixed(0)}{t('unit.gram')}</span>
                   <span>{t('nutrition.fat')}: {userProfile.goals.fat.toFixed(0)}{t('unit.gram')}</span>
                   <span>{t('nutrition.carbs')}: {userProfile.goals.carbs.toFixed(0)}{t('unit.gram')}</span>
                </div>
              </div>
            )}

            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center text-black">{t('dashboard.todaysMeals')} ({formatMobileDate(selectedDate, i18n.language)})</h2>
            <DailyMealLog 
              meals={meals}
              onEditMeal={async (meal) => { 
                setEditingMeal(meal);
                setCurrentScreen('edit');
              }}
              onDeleteMeal={async (mealId) => { 
                if (!user?.uid) return;
                try {
                  await deleteDoc(doc(db, `users/${user.uid}/meals`, mealId));
                  console.log("Meal deleted:", mealId);
                } catch (error) {
                  console.error("Error deleting meal:", error);
                  setError("Failed to delete meal.");
                }
              }}
            />
          </>
        )}
        {currentScreen === 'addMeal' && (
          <AddMealScreen 
            onClose={handleAddMealClose}
          />
        )}
        {currentScreen === 'edit' && editingMeal && (
          <EditMealScreen 
            meal={editingMeal}
            onClose={() => {
              setEditingMeal(null);
              setCurrentScreen('main');
            }}
          />
        )}
      </main>

      {currentScreen === 'main' && (
        <button
          onClick={handleAddMeal}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg z-10 transition-colors duration-200 ease-in-out text-2xl sm:text-3xl"
          aria-label={t('aria.addMeal')}
        >
          <IoAddCircle />
        </button>
      )}
    </div>
  );
};

export default App;