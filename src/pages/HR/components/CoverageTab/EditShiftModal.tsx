import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { shiftService, Shift } from '../../../../services/hr/shift.service';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onSuccess: () => void;
}

export const EditShiftModal = ({ isOpen, onClose, shift, onSuccess }: EditShiftModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    min_employees_required: 1,
    color: '#3B82F6'
  });

  useEffect(() => {
    if (shift && isOpen) {
      setFormData({
        name: shift.name || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        min_employees_required: shift.min_employees_required || 1,
        color: shift.color || '#3B82F6'
      });
    }
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time) {
      toast.error('Nombre y horario son obligatorios');
      return;
    }

    if (formData.min_employees_required < 1) {
      toast.error('El mínimo de empleados debe ser al menos 1');
      return;
    }

    setLoading(true);
    try {
      await shiftService.update(shift!.id, {
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        min_employees_required: formData.min_employees_required,
        color: formData.color
      });
      toast.success('Turno actualizado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Error al actualizar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Editar Turno</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del turno</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ej: Mañana, Tarde, Noche"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mínimo de empleados requeridos
            </label>
            <input
              type="number"
              min="1"
              value={formData.min_employees_required}
              onChange={(e) => setFormData({ ...formData, min_employees_required: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número mínimo de empleados que deben estar asignados a este turno
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color del turno</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">{formData.color}</span>
            </div>
          </div>
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
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
