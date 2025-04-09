import React, { useState, useRef, useEffect } from 'react';
import { Meal, MealCategory, MEAL_CATEGORIES, NutritionData } from '@/types';
import { analyzeMeal } from '@/api/analyze-meal';
import { formatNumber } from '@/utils/formatNumber';

interface AddMealFormProps {
  onSubmit: (meal: Meal) => void;
  hasUserParameters: boolean;
}

export const AddMealForm: React.FC<AddMealFormProps> = ({ onSubmit, hasUserParameters }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>('breakfast');
  const [weight, setWeight] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAiAnalyzed, setIsAiAnalyzed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Автоматически скрываем клавиатуру при тапе вне полей ввода
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetAiSuggestion = async () => {
    if (!name.trim()) {
      setError('Введите описание блюда');
      return;
    }

    if (!hasUserParameters) {
      setError('Для точного анализа укажите свои параметры в настройках');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsAiAnalyzed(false);
    setIsManualEdit(false);

    try {
      const analysis = await analyzeMeal(name);
      console.log('AI Analysis:', { name, analysis }); // Логирование для отладки

      if (analysis.success && analysis.analysis) {
        setWeight(formatNumber(analysis.analysis.weight));
        setCalories(formatNumber(analysis.analysis.calories));
        setProtein(formatNumber(analysis.analysis.protein));
        setFat(formatNumber(analysis.analysis.fat));
        setCarbs(formatNumber(analysis.analysis.carbs));
        setIsAiAnalyzed(true);
      } else {
        setError(analysis.error || 'Не удалось проанализировать блюдо. Попробуйте ещё раз или введите данные вручную.');
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError('Не удалось проанализировать блюдо. Попробуйте ещё раз или введите данные вручную.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = e.target.value;
    setWeight(newWeight);
    
    if (isAiAnalyzed && !isManualEdit) {
      const weightRatio = Number(newWeight) / Number(weight);
      setCalories(formatNumber(Number(calories) * weightRatio));
      setProtein(formatNumber(Number(protein) * weightRatio));
      setFat(formatNumber(Number(fat) * weightRatio));
      setCarbs(formatNumber(Number(carbs) * weightRatio));
    }
  };

  const handleNutritionChange = () => {
    if (!isManualEdit) {
      setIsManualEdit(true);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Введите название блюда');
      return;
    }

    const meal: Meal = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      timestamp: new Date(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      weight: Number(weight) || 100,
    };

    onSubmit(meal);
  };

  return (
    <div ref={formRef} className="p-4 max-w-md mx-auto">
      {!hasUserParameters && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Чтобы точно рассчитывать цели, укажите свои параметры в настройках.</p>
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Название блюда
      </label>
      <input
        type="text"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Например: Овсяная каша с ягодами"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Категория
      </label>
      <select
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value as MealCategory)}
      >
        {MEAL_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Вес (г)
      </label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-2"
        value={weight}
        onChange={handleWeightChange}
        placeholder="100"
      />
      {isAiAnalyzed && !isManualEdit && (
        <p className="text-sm text-gray-500 mb-4">
          Это значение рассчитано автоматически. Если изменить вес, значения КБЖУ пересчитаются.
        </p>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Калории
      </label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={calories}
        onChange={(e) => {
          setCalories(e.target.value);
          handleNutritionChange();
        }}
        placeholder="0"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Белки (г)
      </label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={protein}
        onChange={(e) => {
          setProtein(e.target.value);
          handleNutritionChange();
        }}
        placeholder="0"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Жиры (г)
      </label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={fat}
        onChange={(e) => {
          setFat(e.target.value);
          handleNutritionChange();
        }}
        placeholder="0"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Углеводы (г)
      </label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4"
        value={carbs}
        onChange={(e) => {
          setCarbs(e.target.value);
          handleNutritionChange();
        }}
        placeholder="0"
      />

      {isManualEdit && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p>Режим ручного редактирования. Пересчёт отключён.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <button
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
        onClick={handleGetAiSuggestion}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Анализ...
          </span>
        ) : (
          'Проанализировать'
        )}
      </button>

      <button
        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200"
        onClick={handleSubmit}
      >
        Сохранить
      </button>
    </div>
  );
};
