import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '../../../../services/user.service';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEmployeeModal = ({ isOpen, onClose, onSuccess }: CreateEmployeeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.full_name || !formData.password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await userService.createEmployee({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: 'employee'
      });
      
      toast.success('Empleado creado correctamente');
      setFormData({ email: '', full_name: '', password: '' });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Nuevo Empleado</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="empleado@farmacia.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre Apellido"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
