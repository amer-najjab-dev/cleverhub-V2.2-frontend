import { useState, useEffect } from 'react';
import { employeeService, Employee, Shift } from '../../../../services/hr/employee.service';
import { Plus } from 'lucide-react';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { AssignShiftModal } from './AssignShiftModal';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, shiftsData] = await Promise.all([
        employeeService.getEmployees(),
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



  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Equipo</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {employees.map(emp => (
          <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">{emp.user?.full_name?.charAt(0) || '?'}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{emp.user?.full_name || 'Sin nombre'}</div>
                <div className="text-sm text-gray-500">{emp.user?.email || 'Sin email'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedEmployee({ id: emp.id, name: emp.user?.full_name || 'Empleado' });
                  setShowAssignModal(true);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
              >
                Asignar Turno
              </button>
              <div className="text-sm text-gray-500">
                {emp.vacation_days_used}/{emp.vacation_days} días
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de creación de empleado - Versión antigua (comentada o eliminada) */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo empleado</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Turno por defecto (opcional)</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear</button>
            </div>
          </div>
        </div>
      )} */}

      {/* Modal de creación de empleado */}
      <CreateEmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Recargar la lista de empleados
          loadData();
        }}
      />

      {/* Modal de asignación de turno */}
      <AssignShiftModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        employeeId={selectedEmployee?.id || 0}
        employeeName={selectedEmployee?.name || ''}
        shifts={shifts}
        onSuccess={loadData}
      />
    </div>
  );
};