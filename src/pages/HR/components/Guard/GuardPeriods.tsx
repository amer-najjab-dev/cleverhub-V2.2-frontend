import { useState, useEffect } from 'react';
import { employeeService, Shift } from '../../../../services/hr/employee.service';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GuardPeriod {
  id: number;
  shift_id: number;
  start_date: string;
  end_date: string;
}

export const GuardPeriods = () => {
  const [periods, setPeriods] = useState<GuardPeriod[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ shiftId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [periodsData, shiftsData] = await Promise.all([
        employeeService.getGuardPeriods(),
        employeeService.getShifts()
      ]);
      setPeriods(periodsData);
      setShifts(shiftsData.filter(s => s.is_guard));
    } catch (error) {
      console.error('Error loading guard periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.shiftId || !formData.startDate || !formData.endDate) {
      toast.error('Completa todos los campos');
      return;
    }
    try {
      await employeeService.createGuardPeriod({
        shiftId: parseInt(formData.shiftId),
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      toast.success('Periodo de guardia creado');
      setShowForm(false);
      setFormData({ shiftId: '', startDate: '', endDate: '' });
      loadData();
    } catch (error) {
      toast.error('Error al crear periodo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este periodo?')) return;
    try {
      await employeeService.deleteGuardPeriod(id);
      toast.success('Periodo eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Guardias</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Programar guardia
        </button>
      </div>

      {periods.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
          No hay guardias programadas
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {periods.map(period => {
            const shift = shifts.find(s => s.id === period.shift_id);
            return (
              <div key={period.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{shift?.name || 'Guardia'}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(period.start_date).toLocaleDateString('es-ES')} - {new Date(period.end_date).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <button onClick={() => handleDelete(period.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Programar guardia</h3>
            <div className="space-y-3">
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar turno de guardia</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Fecha fin"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};