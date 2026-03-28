import { useState } from 'react';
import { User, AlertCircle, ChevronRight } from 'lucide-react';

interface Employee {
  id: number;
  user?: {
    full_name: string;
    email: string;
  };
  vacation_days: number;
  vacation_days_used: number;
}

interface TimeOffRequest {
  id: number;
  employee_id: number;
  employeeName?: string;
  status: string;
  type: string;
}

interface EmployeeSidebarProps {
  employees: Employee[];
  requests: TimeOffRequest[];
}

export const EmployeeSidebar = ({ employees, requests }: EmployeeSidebarProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const getPendingRequests = (employeeId: number) => {
    return requests.filter(r => r.employee_id === employeeId && r.status === 'pending').length;
  };

  const getEmployeeVacationStatus = (employee: Employee) => {
    const remaining = employee.vacation_days - employee.vacation_days_used;
    const percentage = (employee.vacation_days_used / employee.vacation_days) * 100;
    return { remaining, percentage };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Equipo</h3>
        <span className="text-xs text-gray-500">{employees.length} empleados</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {employees.map(emp => {
          const pendingCount = getPendingRequests(emp.id);
          const { remaining, percentage } = getEmployeeVacationStatus(emp);
          const isSelected = selectedEmployee === emp.id;

          return (
            <div
              key={emp.id}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedEmployee(isSelected ? null : emp.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {emp.user?.full_name || 'Empleado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {emp.user?.email}
                    </div>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertCircle size={10} className="text-amber-600" />
                    <span className="text-xs text-amber-700">{pendingCount}</span>
                  </div>
                )}
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Vacaciones</span>
                  <span>{emp.vacation_days_used}/{emp.vacation_days} dias</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Restan {remaining} dias
                </div>
              </div>

              {isSelected && (
                <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Ver historial completo
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};