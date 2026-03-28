import { useState } from 'react';
import { Shield, Plus, Trash2, Calendar } from 'lucide-react';
import { Shift, GuardPeriod } from '../../../../services/hr/employee.service';
import { toast } from 'react-hot-toast';

interface GuardScheduleProps {
  shifts: Shift[];
  guardPeriods: GuardPeriod[];
  onCreate: (shiftId: number, startDate: string, endDate: string) => void;
  onDelete: (id: number) => void;
}

export const GuardSchedule = ({ shifts, guardPeriods, onCreate, onDelete }: 
GuardScheduleProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ shiftId: '', startDate: '', 
endDate: '' });

  const guardShifts = shifts.filter(s => s.is_guard);

  const handleSubmit = () => {
    if (!formData.shiftId || !formData.startDate || !formData.endDate) {
      toast.error('Completa todos los campos');
      return;
    }
    if (formData.startDate > formData.endDate) {
      toast.error('La fecha fin debe ser posterior a la fecha inicio');
      return;
    }
    onCreate(parseInt(formData.shiftId), formData.startDate, formData.endDate);
    setShowForm(false);
    setFormData({ shiftId: '', startDate: '', endDate: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-red-600" />
          <h3 className="text-sm font-semibold text-gray-900">Guardias 
Programadas</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center 
gap-1"
        >
          <Plus size={14} />
          Programar
        </button>
      </div>

      {guardPeriods.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay guardias programadas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {guardPeriods.map(period => {
            const shift = shifts.find(s => s.id === period.shift_id);
            return (
              <div key={period.id} className="flex items-center justify-between 
p-2 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-red-800 text-sm">{shift?.name 
|| 'Guardia'}</div>
                  <div className="text-xs text-red-600">
                    {new Date(period.start_date).toLocaleDateString('es-ES')} - 
{new Date(period.end_date).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(period.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Programar guardia</h3>
            <div className="space-y-3">
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: 
e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar turno de guardia</option>
                {guardShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: 
e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: 
e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Fecha fin"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 
border rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 
text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
