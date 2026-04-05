import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { shiftService, Shift } from '../../../../services/hr/shift.service';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift?: Shift | null;
  onSuccess: () => void;
}

const colors = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' }
];

export const ShiftModal = ({ isOpen, onClose, shift, onSuccess }: ShiftModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    start_time: shift?.start_time || '09:00',
    end_time: shift?.end_time || '17:00',
    min_employees_required: shift?.min_employees_required || 1,
    color: shift?.color || '#3B82F6'
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('El nombre del turno es obligatorio');
      return;
    }

    setLoading(true);
    try {
      if (shift) {
        await shiftService.update(shift.id, formData);
        toast.success('Turno actualizado');
      } else {
        await shiftService.create(formData);
        toast.success('Turno creado');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al guardar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{shift ? 'Editar Turno' : 'Nuevo Turno'}</h3>
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Mañana"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo empleados</label>
            <input
              type="number"
              min="1"
              value={formData.min_employees_required}
              onChange={(e) => setFormData({ ...formData, min_employees_required: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full transition ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
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
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
