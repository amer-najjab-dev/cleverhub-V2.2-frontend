import { GripVertical } from 'lucide-react';

interface Employee {
  id: number;
  user?: { full_name: string; email: string };
  vacation_days: number;
  vacation_days_used: number;
}

interface EmployeeSidebarProps {
  employees: Employee[];
  requests: any[];
  onDragStart?: (employee: { id: number; name: string }) => void;
  isDragging?: boolean;
}

export const EmployeeSidebar = ({ employees, onDragStart, isDragging }: EmployeeSidebarProps) => {
  const handleDragStart = (e: React.DragEvent, emp: Employee) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: emp.id, name: emp.user?.full_name }));
    onDragStart?.({ id: emp.id, name: emp.user?.full_name || 'Empleado' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Equipo</h3>
        <span className="text-xs text-gray-500">{employees.length} empleados {isDragging && '(Arrastra para asignar)'}</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {employees.map(emp => {
          const percentage = (emp.vacation_days_used / emp.vacation_days) * 100;
          return (
            <div
              key={emp.id}
              draggable={!isDragging}
              onDragStart={(e) => handleDragStart(e, emp)}
              className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition"
            >
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-400" />
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">{emp.user?.full_name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{emp.user?.full_name || 'Empleado'}</div>
                  <div className="text-xs text-gray-500">{emp.user?.email}</div>
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-gray-500"><span>Vacaciones</span><span>{emp.vacation_days_used}/{emp.vacation_days} días</span></div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">💡 Arrastra cualquier empleado a una celda del calendario</div>
    </div>
  );
};
