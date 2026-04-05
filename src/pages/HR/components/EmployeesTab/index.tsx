import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeService, Employee } from '../../../../services/hr/employee.service';
import { CreateEmployeeModal } from './CreateEmployeeModal';

export const EmployeesTab = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿Eliminar a ${name}?`)) {
      try {
        await employeeService.delete(id);
        toast.success('Empleado eliminado');
        loadEmployees();
      } catch (error) {
        toast.error('Error al eliminar empleado');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Empleados</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Nombre</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Teléfono</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Turno</th>
              <th className="p-3 text-center text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{emp.user?.full_name || 'N/A'}</td>
                <td className="p-3 text-gray-600">{emp.user?.email || 'N/A'}</td>
                <td className="p-3 text-gray-600">{emp.phone || 'N/A'}</td>
                <td className="p-3 text-gray-600">
                  {emp.default_shift_id ? emp.default_shift?.name : 'Sin asignar'}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(emp.id, emp.user?.full_name || 'empleado')}
                    className="text-red-600 hover:text-red-800 transition mx-1"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateEmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadEmployees}
      />
    </div>
  );
};
