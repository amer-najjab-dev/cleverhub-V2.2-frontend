import { useState, useEffect } from 'react';
import { employeeService, Employee, Shift } from '../../../services/hr/employee.service';
import { Plus, Edit, Trash2, User, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    dni: '',
    password: '',
    defaultShiftId: '',
    vacationDays: 25
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, shiftsData] = await Promise.all([
        employeeService.getAllEmployees(),
        employeeService.getShifts()
      ]);
      setEmployees(employeesData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        dni: formData.dni,
        password: formData.password || undefined,
        defaultShiftId: formData.defaultShiftId ? parseInt(formData.defaultShiftId) : undefined,
        vacationDays: formData.vacationDays
      };
      
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, {
          defaultShiftId: data.defaultShiftId,
          vacationDays: data.vacationDays
        });
        toast.success('Empleado actualizado');
      } else {
        await employeeService.createEmployee(data);
        toast.success('Empleado creado');
      }
      loadData();
      setShowModal(false);
      setEditingEmployee(null);
      setFormData({ email: '', fullName: '', phone: '', dni: '', password: '', defaultShiftId: '', vacationDays: 25 });
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este empleado?')) return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success('Empleado eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      email: emp.user?.email || '',
      fullName: emp.user?.full_name || '',
      phone: '',
      dni: '',
      password: '',
      defaultShiftId: emp.default_shift_id?.toString() || '',
      vacationDays: emp.vacation_days
    });
    setShowModal(true);
  };

  const getShiftDisplay = (shift: Shift | undefined) => {
    if (!shift) return 'No asignado';
    return `${shift.name} (${shift.start_time} - ${shift.end_time})${shift.is_guard ? ' 🔥 Guardia' : ''}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Empleados</h2>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setFormData({ email: '', fullName: '', phone: '', dni: '', password: '', defaultShiftId: '', vacationDays: 25 });
            setShowModal(true);
          }}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Nuevo empleado
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay empleados registrados</div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => (
            <div key={emp.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{emp.user?.full_name}</div>
                  <div className="text-sm text-gray-500">{emp.user?.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Turno: {emp.default_shift ? getShiftDisplay(emp.default_shift) : 'No asignado'} | 
                    Vacaciones: {emp.vacation_days_used}/{emp.vacation_days}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEmployee ? 'Editar empleado' : 'Nuevo empleado'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {!editingEmployee && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI/NIF</label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Dejar en blanco para usar 'empleado123'"
                    />
                  </div>
                </>
              )}
              
              {/* ✅ Sección de turno mejorada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno asignado
                </label>
                <select
                  value={formData.defaultShiftId}
                  onChange={(e) => setFormData({ ...formData, defaultShiftId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sin turno asignado</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time} - {shift.end_time})
                      {shift.is_guard && ' 🔥 Guardia'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Shield size={12} />
                  Los empleados con turno asignado aparecerán en el calendario de cobertura
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de vacaciones anuales</label>
                <input
                  type="number"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData({ ...formData, vacationDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Días de vacaciones disponibles por año (por defecto 25)
                </p>
              </div>
              
              {editingEmployee && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">
                    <strong>Vacaciones usadas:</strong> {editingEmployee.vacation_days_used} de {editingEmployee.vacation_days} días
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingEmployee ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};