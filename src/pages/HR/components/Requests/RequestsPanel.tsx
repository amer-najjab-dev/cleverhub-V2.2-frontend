import { User, Calendar, Check, X } from 'lucide-react';
import { TimeOffRequest } from '../../../../services/hr/employee.service';

interface RequestsPanelProps {
  requests: TimeOffRequest[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const getRequestTypeLabel = (type: string) => {
  switch (type) {
    case 'vacation': return 'Vacaciones';
    case 'sick': return 'Enfermedad';
    case 'medical': return 'Cita médica';
    case 'medical_leave': return 'Licencia médica';
    case 'maternity': return 'Baja de maternidad';
    case 'paternity': return 'Baja de paternidad';
    case 'shift_swap': return 'Cambio de turno';
    default: return type;
  }
};

const getRequestColor = (type: string) => {
  switch (type) {
    case 'vacation': return 'bg-green-100 text-green-700';
    case 'sick': return 'bg-amber-100 text-amber-700';
    case 'medical': return 'bg-yellow-100 text-yellow-700';
    case 'medical_leave': return 'bg-blue-100 text-blue-700';
    case 'maternity': return 'bg-purple-100 text-purple-700';
    case 'paternity': return 'bg-orange-100 text-orange-700';
    case 'shift_swap': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const RequestsPanel = ({ requests, onApprove, onReject }: 
RequestsPanelProps) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <div className="text-gray-500 text-sm">✓ No hay solicitudes 
pendientes</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Solicitudes 
Pendientes ({pendingRequests.length})</h3>
      <div className="space-y-3">
        {pendingRequests.map(req => (
          <div key={req.id} className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center 
justify-center">
                <User size={14} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{req.employeeName || 
`Empleado ${req.employee_id}`}</div>
                <div className="text-xs text-gray-500">{req.employeeEmail}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full 
${getRequestColor(req.type)}`}>
                    {getRequestTypeLabel(req.type)}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center 
gap-1">
                    <Calendar size={10} />
                    {new Date(req.start_date).toLocaleDateString('es-ES')} - 
{new Date(req.end_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                {req.notes && (
                  <div className="text-xs text-gray-500 mt-1">Motivo: 
{req.notes}</div>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onApprove(req.id)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Aprobar"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => onReject(req.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Rechazar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
