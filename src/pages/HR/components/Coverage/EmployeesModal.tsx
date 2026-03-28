import { X, User, Mail, Trash2 } from 'lucide-react';

interface Employee {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

interface EmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  shiftName: string;
  shiftId: number;
  employees: Employee[];
  onRemoveEmployee?: (employeeId: number, shiftId: number, date: string) => void;
}

export const EmployeesModal = ({ 
  isOpen, 
  onClose, 
  date, 
  shiftName, 
  shiftId,
  employees, 
  onRemoveEmployee 
}: EmployeesModalProps) => {
  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleRemove = (employeeId: number) => {
    if (confirm(`¿Eliminar a ${employees.find(e => e.id === employeeId)?.name || 'empleado'} de este turno?`)) {
      onRemoveEmployee?.(employeeId, shiftId, date);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {shiftName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay empleados asignados a este turno</p>
              <p className="text-xs text-gray-400 mt-1">Arrastra un empleado desde el panel lateral</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{emp.name || `Empleado ${emp.id}`}</div>
                      {emp.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail size={12} />
                          {emp.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(emp.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Eliminar de este turno"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total empleados:</span>
            <span className="font-semibold text-gray-900">{employees.length}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            💡 Arrastra empleados desde el panel lateral para añadir más
          </div>
        </div>
      </div>
    </div>
  );
};