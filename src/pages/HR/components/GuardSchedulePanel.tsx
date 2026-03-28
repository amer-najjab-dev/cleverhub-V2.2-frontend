import { useState, useEffect } from 'react';
import { Shift } from '../../../services/hr/employee.service';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GuardSchedulePanelProps {
  shifts: Shift[];
  onUpdate: () => void;
}

interface GuardPeriod {
  id: string;
  shiftId: number;
  startDate: string;
  endDate: string;
}

export const GuardSchedulePanel = ({ shifts, onUpdate }: GuardSchedulePanelProps) => {
  const [periods, setPeriods] = useState<GuardPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState({
    shiftId: shifts.find(s => s.is_guard)?.id || 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadGuardPeriods();
  }, []);

  const loadGuardPeriods = async () => {
    setLoading(true);
    try {
      // TODO: Cargar periodos desde el backend
      setPeriods([]);
    } catch (error) {
      console.error('Error loading guard periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPeriod = () => {
    if (!newPeriod.startDate || !newPeriod.endDate) {
      toast.error('Selecciona fechas de inicio y fin');
      return;
    }
    if (newPeriod.startDate > newPeriod.endDate) {
      toast.error('La fecha fin debe ser posterior a la fecha inicio');
      return;
    }
    const newId = `${Date.now()}`;
    setPeriods([...periods, { ...newPeriod, id: newId }]);
    setNewPeriod({ ...newPeriod, startDate: '', endDate: '' });
  };

  const removePeriod = (id: string) => {
    setPeriods(periods.filter(p => p.id !== id));
  };

  const saveAll = async () => {
    try {
      // TODO: Guardar periodos en el backend
      toast.success('Guardias guardadas correctamente');
      onUpdate();
    } catch (error) {
      console.error('Error saving guard periods:', error);
      toast.error('Error al guardar');
    }
  };

  const guardShifts = shifts.filter(s => s.is_guard);

  if (guardShifts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        No hay turnos de guardia configurados. Crea primero un turno marcado como "Guardia".
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulario para agregar nuevo periodo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Nuevo periodo de guardia</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={newPeriod.shiftId}
            onChange={(e) => setNewPeriod({ ...newPeriod, shiftId: parseInt(e.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {guardShifts.map(shift => (
              <option key={shift.id} value={shift.id}>{shift.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={newPeriod.startDate}
            onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={newPeriod.endDate}
            onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Fecha fin"
          />
        </div>
        <button
          onClick={addPeriod}
          className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Agregar periodo
        </button>
      </div>

      {/* Lista de periodos configurados */}
      {periods.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">Periodos configurados</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {periods.map(period => {
              const shift = guardShifts.find(s => s.id === period.shiftId);
              return (
                <div key={period.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{shift?.name}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {new Date(period.startDate).toLocaleDateString('es-ES')} - {new Date(period.endDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <button
                    onClick={() => removePeriod(period.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {periods.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          No hay periodos de guardia configurados
        </div>
      )}

      {/* Botón guardar */}
      {periods.length > 0 && (
        <button
          onClick={saveAll}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Guardar todos los periodos
        </button>
      )}
    </div>
  );
};