import { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Shift } from '../../../../services/hr/shift.service';
import { employeeService, Employee } from '../../../../services/hr/employee.service';
import { assignmentService } from '../../../../services/hr/assignment.service';

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  shifts: Shift[];
  onSuccess: () => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const AssignShiftModal = ({ 
  isOpen, 
  onClose, 
  shift, 
  shifts, 
  onSuccess,
  defaultStartDate,
  defaultEndDate
}: AssignShiftModalProps) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: shift?.id.toString() || '',
    startDate: defaultStartDate || '',
    endDate: defaultEndDate || ''
  });

  // Actualizar formData cuando cambian las props
  useEffect(() => {
    if (defaultStartDate && defaultEndDate) {
      setFormData(prev => ({
        ...prev,
        startDate: defaultStartDate,
        endDate: defaultEndDate
      }));
    }
  }, [defaultStartDate, defaultEndDate]);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (shift) {
      setFormData(prev => ({ ...prev, shiftId: shift.id.toString() }));
    }
  }, [shift]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.shiftId || !formData.startDate || !formData.endDate) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('La fecha fin debe ser posterior a la fecha inicio');
      return;
    }

    setLoading(true);
    try {
      await assignmentService.assignRange(
        parseInt(formData.employeeId),
        parseInt(formData.shiftId),
        formData.startDate,
        formData.endDate
      );
      toast.success('Turno asignado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al asignar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Asignar Turno</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar empleado</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.user?.full_name} ({emp.user?.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={formData.shiftId}
              onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar turno</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.start_time}-{s.end_time})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              📅 Días a asignar: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
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