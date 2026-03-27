import { useState, useEffect } from 'react';
import { employeeService, CoverageData } from '../../../services/hr/employee.service';
import { toast } from 'react-hot-toast';

interface CoverageCalendarProps {
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
  onDateChange: (date: Date) => void;
  isAdmin: boolean;
}

export const CoverageCalendar = ({ view, onViewChange }: CoverageCalendarProps) => {
  const [coverage, setCoverage] = useState<CoverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, _setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchCoverage();
  }, [currentDate]);

  const fetchCoverage = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate);
      start.setDate(1);
      const end = new Date(currentDate);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      
      const data = await employeeService.getCoverage({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      setCoverage(data);
    } catch (error) {
      console.error('Error fetching coverage:', error);
      toast.error('Error al cargar cobertura');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por día
  const coverageByDay = coverage.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, CoverageData[]>);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Semanal
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Días del mes - simplificado */}
        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayCoverage = coverageByDay[dateStr] || [];
          const hasRisk = dayCoverage.some(c => c.currentCount < c.requiredMin);
          
          return (
            <div
              key={day}
              className={`p-2 border rounded-lg text-center ${
                hasRisk ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="text-sm font-medium">{day}</div>
              {dayCoverage.map(c => (
                <div key={c.shiftId} className="text-xs mt-1">
                  <span className={c.currentCount < c.requiredMin ? 'text-amber-700' : 'text-green-700'}>
                    {c.shiftName}: {c.currentCount}/{c.requiredMin}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};