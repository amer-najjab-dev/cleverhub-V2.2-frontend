import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-hot-toast';
import { calendarService, CalendarEvent } from '../../../../services/hr/calendar.service';

export const CalendarTab = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startStr = startOfMonth.toISOString().split('T')[0];
      const endStr = endOfMonth.toISOString().split('T')[0];
      
      const data = await calendarService.getEvents(startStr, endStr);
      setEvents(data);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const getEventClassName = (event: CalendarEvent) => {
    switch (event.type) {
      case 'holiday':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'vacation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sick':
      case 'medical_leave':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maternity':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'paternity':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateChange = (info: any) => {
    setCurrentDate(info.view.currentStart);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando calendario...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        events={events.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          className: getEventClassName(event),
          backgroundColor: event.color,
          borderColor: event.color
        }))}
        datesSet={handleDateChange}
        height="auto"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }}
      />
      
      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Leyenda</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">Festivos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Vacaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Bajas médicas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-xs text-gray-600">Baja de maternidad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Baja de paternidad</span>
          </div>
        </div>
      </div>
    </div>
  );
};