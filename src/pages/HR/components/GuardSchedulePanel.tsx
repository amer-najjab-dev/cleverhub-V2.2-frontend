// src/pages/HR/components/GuardSchedulePanel.tsx
import { useState, useEffect } from 'react';
import { employeeService } from '../../../services/hr/employee.service';
import { Calendar, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GuardSchedulePanelProps {
  shiftId: number;
  shiftName: string;
  onSave?: () => void;
}

export const GuardSchedulePanel = ({ shiftId, shiftName, onSave }: GuardSchedulePanelProps) => {
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  // ✅ Eliminado 'loading' no usado, o si lo necesitas, descomenta la línea comentada
  // const [loading, setLoading] = useState(true);

  const weeksOfYear = Array.from({ length: 52 }, (_, i) => i + 1);

  useEffect(() => {
    loadGuardWeeks();
  }, [shiftId]);

  const loadGuardWeeks = async () => {
    try {
      const schedules = await employeeService.getGuardSchedules();
      const shiftSchedule = schedules.find(s => s.shiftId === shiftId);
      setSelectedWeeks(shiftSchedule?.weeks || []);
    } catch (error) {
      console.error('Error loading guard weeks:', error);
      toast.error('Error al cargar semanas de guardia');
    }
  };

  const handleWeekToggle = (weekNumber: number) => {
    setSelectedWeeks(prev => {
      if (prev.includes(weekNumber)) {
        return prev.filter(w => w !== weekNumber);
      } else {
        return [...prev, weekNumber].sort((a, b) => a - b);
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await employeeService.updateGuardSchedule(shiftId, selectedWeeks);
      toast.success('Semanas de guardia guardadas');
      onSave?.();
    } catch (error) {
      console.error('Error saving guard weeks:', error);
      toast.error('Error al guardar semanas de guardia');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-600" />
          Semanas de guardia - {shiftName}
        </label>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition disabled:opacity-50 flex items-center gap-1"
        >
          <Save className="w-3 h-3" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-13 gap-1 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {weeksOfYear.map((week) => (
          <button
            key={week}
            onClick={() => handleWeekToggle(week)}
            className={`w-8 h-8 text-xs rounded-lg transition-colors ${
              selectedWeeks.includes(week)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {week}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        <Calendar className="w-3 h-3" />
        Selecciona las semanas del año en las que aplica este turno de guardia
      </div>
    </div>
  );
};