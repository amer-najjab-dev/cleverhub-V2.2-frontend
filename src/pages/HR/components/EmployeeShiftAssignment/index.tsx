import { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeService } from '../../../../services/hr/employee.service';

interface EmployeeShiftAssignmentProps {
  shiftId: number;
  shiftName: string;
  date: string;
  onClose: () => void;
  onAssign: () => void;
}

export const EmployeeShiftAssignment = ({ shiftId, shiftName, date, onClose, onAssign }: 
EmployeeShiftAssignmentProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [shiftId, date]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allEmployees = await employeeService.getEmployees();
      const assignments = await employeeService.getShiftAssignments(shiftId, date);
      setEmployees(allEmployees);
      setAssignedIds(assignments.map((a: any) => a.employee_id));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = async (employeeId: number) => {
    const isAssigned = assignedIds.includes(employeeId);
    
    try {
      if (isAssigned) {
        await employeeService.removeShiftAssignment(shiftId, employeeId, date);
        setAssignedIds(prev => prev.filter(id => id !== employeeId));
        toast.success('Empleado removido');
      } else {
        await employeeService.assignEmployeeToShift(employeeId, shiftId, date);
        setAssignedIds(prev => [...prev, employeeId]);
        toast.success('Empleado asignado');
      }
      onAssign();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al modificar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Asignar empleados - {shiftName}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Fecha: {new Date(date).toLocaleDateString('es-ES')}</p>
          
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay empleados</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map(employee => (
                <div
                  key={employee.id}
                  onClick={() => toggleEmployee(employee.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    assignedIds.includes(employee.id)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <div className="font-medium">{employee.fullName}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </div>
                  {assignedIds.includes(employee.id) && <Check className="w-5 h-5 text-green-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
