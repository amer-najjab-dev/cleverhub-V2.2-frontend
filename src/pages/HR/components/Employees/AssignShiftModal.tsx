import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { employeeService, Shift } from '../../../../services/hr/employee.service';

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  shifts: Shift[];
  onSuccess: () => void;
}

export const AssignShiftModal = ({ isOpen, onClose, employeeId, employeeName, shifts, onSuccess }: AssignShiftModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shiftId: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.shiftId || !formData.startDate || !formData.endDate) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (formData.startDate > formData.endDate) {
      toast.error('La fecha fin debe ser posterior a la fecha inicio');
      return;
    }

    setLoading(true);
    try {
      await employeeService.assignShiftWithRange(
        employeeId,
        parseInt(formData.shiftId),
        formData.startDate.toISOString().split('T')[0],
        formData.endDate.toISOString().split('T')[0]
      );
      toast.success(`Turno asignado del ${formData.startDate.toLocaleDateString()} al ${formData.endDate.toLocaleDateString()}`);
      onSuccess();
      onClose();
      setFormData({ shiftId: '', startDate: null, endDate: null });
    } catch (error: any) {
      console.error('Error assigning shift:', error);
      toast.error(error.response?.data?.message || 'Error al asignar turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Asignar turno - {employeeName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno *
            </label>
            <select
              value={formData.shiftId}
              onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar turno</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.start_time} - {shift.end_time})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio *
            </label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) => setFormData({ ...formData, startDate: date })}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholderText="Seleccionar fecha inicio"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin *
            </label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) => setFormData({ ...formData, endDate: date })}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate || new Date()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholderText="Seleccionar fecha fin"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Asignando...' : 'Asignar Turno'}
          </button>
        </div>
      </div>
    </div>
  );
};