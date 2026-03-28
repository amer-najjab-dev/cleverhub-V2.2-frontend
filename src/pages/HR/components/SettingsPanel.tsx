// src/pages/HR/components/SettingsPanel.tsx
import { useState, useEffect } from 'react';
import { employeeService, Shift, Holiday } from '../../../services/hr/employee.service';
import { Trash2, Calendar, Clock, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GuardSchedulePanel } from './GuardSchedulePanel';

export const SettingsPanel = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newShift, setNewShift] = useState({ name: '', startTime: '09:00', endTime: '14:00', isGuard: false, minEmployeesRequired: 1 });
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', isRecurring: false });
  const [loading, setLoading] = useState(true);
  // ✅ Eliminada variable no usada 'setGuardWeeks'
  // const [guardWeeks, setGuardWeeks] = useState<{ shiftId: number; weeks: number[] }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftsData, holidaysData] = await Promise.all([
        employeeService.getShifts(),
        employeeService.getHolidays()
      ]);
      setShifts(shiftsData);
      setHolidays(holidaysData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async () => {
    if (!newShift.name) return;
    try {
      await employeeService.createShift(newShift);
      toast.success('Turno creado');
      loadData();
      setNewShift({ name: '', startTime: '09:00', endTime: '14:00', isGuard: false, minEmployeesRequired: 1 });
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Error al crear turno');
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm('¿Eliminar este turno?')) return;
    try {
      await employeeService.deleteShift(id);
      toast.success('Turno eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Error al eliminar turno');
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      await employeeService.createHoliday(newHoliday);
      toast.success('Festivo agregado');
      loadData();
      setNewHoliday({ name: '', date: '', isRecurring: false });
    } catch (error) {
      console.error('Error creating holiday:', error);
      toast.error('Error al agregar festivo');
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    try {
      await employeeService.deleteHoliday(id);
      toast.success('Festivo eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Error al eliminar festivo');
    }
  };

  // ✅ Eliminadas funciones no utilizadas: handleWeekToggle, saveGuardWeeks, getGuardWeeksForShift
  // Estas funciones ahora están dentro del componente GuardSchedulePanel

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Turnos */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Configuración de turnos
        </h2>
        <div className="space-y-3 mb-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {shift.name}
                    {shift.is_guard && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Guardia
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{shift.start_time} - {shift.end_time}</div>
                  <div className="text-xs text-gray-400">Mínimo: {shift.min_employees_required} empleados</div>
                </div>
                <button
                  onClick={() => handleDeleteShift(shift.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {/* Panel de semanas de guardia solo para turnos de guardia */}
              {shift.is_guard && (
                <GuardSchedulePanel
                  shiftId={shift.id}
                  shiftName={shift.name}
                  onSave={loadData}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Nuevo turno</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Nombre"
              value={newShift.name}
              onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="time"
              value={newShift.startTime}
              onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="time"
              value={newShift.endTime}
              onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Mínimo empleados"
              value={newShift.minEmployeesRequired}
              onChange={(e) => setNewShift({ ...newShift, minEmployeesRequired: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={newShift.isGuard}
              onChange={(e) => setNewShift({ ...newShift, isGuard: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Es guardia
            </span>
          </label>
          <button
            onClick={handleAddShift}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Agregar turno
          </button>
        </div>
      </div>
      
      {/* Festivos */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Festivos
        </h2>
        <div className="space-y-3 mb-4">
          {holidays.map((holiday) => (
            <div key={holiday.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{holiday.name}</div>
                <div className="text-sm text-gray-500">{new Date(holiday.date).toLocaleDateString('es-ES')}</div>
                {holiday.is_recurring && (
                  <span className="text-xs text-green-600">Recurrente anual</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteHoliday(holiday.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Nuevo festivo</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
          />
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
          />
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={newHoliday.isRecurring}
              onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Festivo recurrente (cada año)</span>
          </label>
          <button
            onClick={handleAddHoliday}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Agregar festivo
          </button>
        </div>
      </div>
    </div>
  );
};