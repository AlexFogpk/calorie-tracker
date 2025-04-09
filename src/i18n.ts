import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      // Общие
      'error.general': 'Произошла ошибка. Пожалуйста, попробуйте позже.',
      'error.network': 'Нет подключения к серверу. Проверьте интернет-соединение.',
      'error.retry': 'Повторить',
      
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
      
      // Настройки
      'settings.title': 'Настройки',
      'settings.parameters': 'Параметры',
      'settings.weight': 'Вес (кг)',
      'settings.height': 'Рост (см)',
      'settings.age': 'Возраст',
      'settings.gender': 'Пол',
      'settings.activity': 'Уровень активности',
      'settings.goal': 'Цель',
      'settings.save': 'Сохранить',
      
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