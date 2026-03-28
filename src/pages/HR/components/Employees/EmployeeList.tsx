import { useState, useEffect } from 'react';
import { employeeService, Employee, Shift } from '../../../../services/hr/employee.service';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', shiftId: '' });

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

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    try {
      await employeeService.createEmployee({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shiftId: formData.shiftId ? parseInt(formData.shiftId) : undefined
      });
      toast.success('Empleado creado');
      loadData();
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', shiftId: '' });
    } catch (error) {
      toast.error('Error al crear empleado');
    }
  };

  const handleShiftChange = async (employeeId: number, shiftId: number) => {
    try {
      await employeeService.updateEmployeeShift(employeeId, shiftId);
      toast.success('Turno actualizado');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar turno');
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
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Añadir empleado
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {employees.map(emp => (
          <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">{emp.fullName.charAt(0)}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{emp.fullName}</div>
                <div className="text-sm text-gray-500">{emp.email}</div>
                {emp.phone && <div className="text-xs text-gray-400">{emp.phone}</div>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={emp.shiftId || ''}
                onChange={(e) => handleShiftChange(emp.id, parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Sin turno</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime}-{shift.endTime})
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">
                {emp.vacationDaysUsed}/{emp.vacationDays} días
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
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
      )}
    </div>
  );
};