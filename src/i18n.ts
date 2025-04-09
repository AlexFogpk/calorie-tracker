import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      // Общие
      'app.title': 'Трекер Калорий',
      'nav.home': 'Главная',
      'error.general': 'Произошла ошибка. Пожалуйста, попробуйте позже.',
      'error.network': 'Нет подключения к серверу. Проверьте интернет-соединение.',
      'error.retry': 'Повторить',
      
      // Aria Labels (Accessibility)
      'aria.toggleCalendar': 'Переключить календарь',
      'aria.userSettings': 'Настройки пользователя',
      'aria.addMeal': 'Добавить прием пищи',

      // Dashboard
      'dashboard.progress': 'Сегодняшний прогресс',
      'dashboard.todaysMeals': 'Приемы пищи за сегодня',
      
      // Meal Categories
      'meal.category.breakfast': 'Завтрак',
      'meal.category.lunch': 'Обед',
      'meal.category.dinner': 'Ужин',
      'meal.category.snack': 'Перекус',

      // Units
      'unit.kcal': 'ккал',
      'unit.gram': 'г',

      // Форма добавления еды
      'meal.name': 'Название блюда',
      'meal.category': 'Категория',
      'meal.weight': 'Вес (г)',
      'meal.calories': 'Калории',
      'meal.protein': 'Белки (г)',
      'meal.fat': 'Жиры (г)',
      'meal.carbs': 'Углеводы (г)',
      'meal.analyze': 'Проанализировать',
      'meal.save': 'Сохранить',
      'meal.aiAnalyzed': 'Это значение рассчитано автоматически. Если изменить вес, значения КБЖУ пересчитаются.',
      'meal.manualEdit': 'Режим ручного редактирования. Пересчёт отключён.',
      'meal.error.noName': 'Введите название блюда',
      'meal.error.noParameters': 'Для точного анализа укажите свои параметры в настройках',
      'meal.error.analysisFailed': 'Не удалось проанализировать блюдо. Попробуйте ещё раз или введите данные вручную.',

      // Meal Log
      'meal.log.noMeals': '— Нет приёмов пищи —',
      
      // Настройки
      'settings.title': 'Мои параметры',
      'settings.parameters': 'Параметры',
      'settings.weight': 'Вес (кг)',
      'settings.height': 'Рост (см)',
      'settings.age': 'Возраст',
      'settings.gender': 'Пол',
      'settings.gender.male': 'Мужской',
      'settings.gender.female': 'Женский',
      'settings.activity': 'Уровень активности',
      'settings.activityLevel': 'Уровень активности',
      'settings.goal': 'Цель',
      'settings.save': 'Сохранить',
      'settings.error.updateFailed': 'Не удалось обновить параметры. Пожалуйста, попробуйте еще раз.',
      'settings.goals.title': 'Рекомендуемые цели по питанию',
      'settings.goals.calculate': 'Рассчитать цели',
      'settings.goals.calories': 'Калории',
      'settings.goals.protein': 'Белки',
      'settings.goals.fat': 'Жиры',
      'settings.goals.carbs': 'Углеводы',
      'settings.calculatedGoals.title': 'Рассчитанные дневные цели',
      'settings.activity.sedentary': 'Сидячий',
      'settings.activity.lightly_active': 'Малоактивный',
      'settings.activity.moderately_active': 'Умеренно активный',
      'settings.activity.very_active': 'Очень активный',
      'settings.goal.lose_weight': 'Снижение веса',
      'settings.goal.maintenance': 'Поддержание веса',
      'settings.goal.gain_muscle': 'Набор мышечной массы',
      'settings.select.placeholder': 'Выберите...',
      
      // Nutrition labels (used with values)
      'nutrition.calories': 'Калории',
      'nutrition.protein': 'Белки',
      'nutrition.fat': 'Жиры',
      'nutrition.carbs': 'Углеводы',

      // Уведомления
      'notification.success': 'Успешно',
      'notification.error': 'Ошибка',
      'notification.warning': 'Предупреждение',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 