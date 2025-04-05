import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { IoChevronBack, IoChevronForward, IoCalendarOutline } from 'react-icons/io5';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  compact?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  // Получаем день недели для первого дня месяца (0 = воскресенье, 1 = понедельник, ...)
  const firstDayOfMonth = monthStart.getDay();
  // Преобразуем в формат, где понедельник = 0, воскресенье = 6
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  // Создаем массив пустых ячеек для дней до начала месяца
  const emptyDays = Array(firstDayIndex).fill(null);

  const CompactDisplay = () => (
    <motion.button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <IoCalendarOutline className="text-gray-500" size={20} />
      <span className="text-gray-700 font-medium">
        {format(selectedDate, 'd MMMM', { locale: ru })}
      </span>
    </motion.button>
  );

  const CalendarModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-40"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl overflow-hidden mt-24 max-w-sm w-full mx-4"
      >
        <div className="p-4">
          {/* Заголовок с месяцем и кнопками навигации */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoChevronBack size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoChevronForward size={20} />
            </button>
          </div>

          {/* Сетка дней недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-700 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Сетка дней месяца */}
          <div className="grid grid-cols-7 gap-1">
            {/* Пустые ячейки до начала месяца */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Дни месяца */}
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                    ${isSelected
                      ? 'bg-blue-500 text-white'
                      : isCurrentDay
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  {format(day, 'd')}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={compact ? "max-w-[200px]" : "w-full max-w-sm mx-auto"}>
      <CompactDisplay />
      <AnimatePresence>
        {isOpen && <CalendarModal />}
      </AnimatePresence>
    </div>
  );
};

export default Calendar; 