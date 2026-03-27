import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { employeeService, CoverageData } from '../../../services/hr/employee.service';
import { toast } from 'react-hot-toast';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CoverageEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  shiftName: string;
  currentCount: number;
  requiredMin: number;
  isCritical: boolean;
}

interface CoverageCalendarProps {
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
  onDateChange: (date: Date) => void;
  isAdmin: boolean;
}

export const CoverageCalendar = ({ view, onViewChange, onDateChange, isAdmin }: CoverageCalendarProps) => {
  const [events, setEvents] = useState<CoverageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<{ id: number; name: string } | null>(null);
  const [overrideValue, setOverrideValue] = useState<number>(0);
  const [shifts, setShifts] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchCoverage();
    loadShifts();
  }, [currentDate]);

  const loadShifts = async () => {
    try {
      const data = await employeeService.getShifts();
      setShifts(data.map(s => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const fetchCoverage = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate);
      start.setDate(1);
      const end = new Date(currentDate);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      
      const coverageData = await employeeService.getCoverage({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      const mappedEvents: CoverageEvent[] = coverageData.map((item: CoverageData) => ({
        id: `${item.date}-${item.shiftId}`,
        title: `${item.shiftName}: ${item.currentCount}/${item.requiredMin}`,
        start: new Date(item.date),
        end: new Date(item.date),
        shiftName: item.shiftName,
        currentCount: item.currentCount,
        requiredMin: item.requiredMin,
        isCritical: item.currentCount < item.requiredMin
      }));
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching coverage:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CoverageEvent) => {
    let backgroundColor = event.isCritical ? '#fee2e2' : '#dcfce7';
    let borderColor = event.isCritical ? '#ef4444' : '#22c55e';
    
    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (!isAdmin) return;
    const dateStr = start.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowOverrideModal(true);
  };

  const handleSaveOverride = async () => {
    if (!selectedShift || !selectedDate || !overrideValue) return;
    try {
      await employeeService.setConfigOverride({
        shiftId: selectedShift.id,
        date: selectedDate,
        minEmployeesRequired: overrideValue
      });
      toast.success('Configuracion actualizada');
      fetchCoverage();
      setShowOverrideModal(false);
    } catch (error) {
      console.error('Error saving override:', error);
      toast.error('Error al guardar');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              view === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              view === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semanal
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Cobertura OK</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Riesgo Operativo</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view === 'month' ? Views.MONTH : Views.WEEK}
          onView={(v: any) => onViewChange(v === Views.MONTH ? 'month' : 'week')}
          date={currentDate}
          onNavigate={(date: Date) => {
            setCurrentDate(date);
            onDateChange(date);
          }}
          onSelectSlot={handleSelectSlot}
          selectable={isAdmin}
          eventPropGetter={eventStyleGetter}
          formats={{
            dayFormat: 'dd EEE',
            weekdayFormat: 'EEE dd',
          }}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Dia',
          }}
          className="h-[600px]"
        />
      )}
      
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar minimo por turno</h3>
            <p className="text-sm text-gray-600 mb-4">Fecha: {selectedDate}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  const [id, name] = e.target.value.split('|');
                  setSelectedShift({ id: parseInt(id), name });
                }}
              >
                <option value="">Seleccionar turno</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={`${shift.id}|${shift.name}`}>{shift.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimo empleados requerido</label>
              <input
                type="number"
                value={overrideValue}
                onChange={(e) => setOverrideValue(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};