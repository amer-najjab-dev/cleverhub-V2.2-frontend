import { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeService } from '../../../../services/hr/employee.service';

interface ShiftConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: number;
  shiftName: string;
  currentMin: number;
  onUpdate: () => void;
}

export const ShiftConfigModal = ({ isOpen, onClose, shiftId, shiftName, 
currentMin, onUpdate }: ShiftConfigModalProps) => {
  const [minEmployees, setMinEmployees] = useState(currentMin);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (minEmployees < 0) {
      toast.error('El mínimo no puede ser negativo');
      return;
    }
    setLoading(true);
    try {
      await employeeService.updateShiftConfig(shiftId, minEmployees);
      toast.success('Configuración actualizada');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 
overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b 
border-gray-200">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Configurar {shiftName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 
rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mínimo de empleados requeridos
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={minEmployees}
              onChange={(e) => setMinEmployees(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Las alertas de riesgo se activarán cuando haya menos de 
{minEmployees} empleados en este turno
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end 
gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg 
hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
