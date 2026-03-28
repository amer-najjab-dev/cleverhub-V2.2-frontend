import { useState, useEffect } from 'react';
import { employeeService, TimeOffRequest } from '../../../../services/hr/employee.service';
import { Calendar, Check, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const TimeOffRequests = () => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', notes: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await employeeService.getTimeOffRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error('Selecciona las fechas');
      return;
    }
    try {
      await employeeService.createTimeOffRequest({
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes
      });
      toast.success('Solicitud enviada');
      setShowForm(false);
      setFormData({ startDate: '', endDate: '', notes: '' });
      loadRequests();
    } catch (error) {
      toast.error('Error al enviar solicitud');
    }
  };

  const handleApprove = async (id: number) => {
    await employeeService.approveTimeOff(id);
    loadRequests();
  };

  const handleReject = async (id: number) => {
    await employeeService.rejectTimeOff(id);
    loadRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'sick': return 'Enfermedad';
      default: return 'Personal';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Ausencias</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Solicitar ausencia
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {requests.map(req => (
          <div key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar size={18} className="text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{req.employeeName || `Empleado ${req.employee_id}`}</div>
                <div className="text-sm text-gray-500">
                  {new Date(req.start_date).toLocaleDateString('es-ES')} - {new Date(req.end_date).toLocaleDateString('es-ES')}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {getTypeLabel(req.type)} • {req.notes}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
              </span>
              {req.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => handleApprove(req.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleReject(req.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Solicitar ausencia</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="Fecha inicio"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="Fecha fin"
                />
              </div>
              <textarea
                placeholder="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};