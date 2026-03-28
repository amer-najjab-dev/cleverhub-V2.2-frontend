import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../../hooks/useHRData';

interface CalendarViewProps {
  events: CalendarEvent[];
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  onDateChange: (date: Date) => void;
}

const getEventColor = (type: string): string => {
  switch (type) {
    case 'vacation': return 'bg-green-100 text-green-700 border-green-200';
    case 'sick': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'medical': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'medical_leave': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'maternity': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'paternity': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'guard': return 'bg-red-100 text-red-700 border-red-200';
    case 'holiday': return 'bg-gray-100 text-gray-500 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const CalendarView = ({ events, view, onViewChange, onDateChange }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const targetDate = new Date(date);
      return eventStart <= targetDate && eventEnd >= targetDate;
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const goPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  const goNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(today);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{formatMonth(currentDate)}</h3>
          <div className="flex gap-1">
            <button onClick={goPrevious} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goNext} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={20} />
            </button>
            <button onClick={goToday} className="ml-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Hoy
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDay(day);
          
          return (
            <div
              key={idx}
              className={`min-h-[100px] p-1 border rounded-lg ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
            >
              <div className={`text-right text-sm p-1 ${
                isToday ? 'font-bold text-blue-600' : 'text-gray-600'
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                    title={event.title}
                  >
                    {event.title.length > 20 ? event.title.substring(0, 18) + '...' : event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 px-1">
                    +{dayEvents.length - 3} mas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Vacaciones</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-gray-600">Enfermedad</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">Guardias</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-xs text-gray-600">Baja maternidad</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-xs text-gray-600">Festivos</span>
        </div>
      </div>
    </div>
  );
};