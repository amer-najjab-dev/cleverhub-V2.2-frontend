import { useState, useEffect } from 'react';
import { employeeService, TimeOffRequest } from 
'../../../services/hr/employee.service';
import { Check, X, Umbrella } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TimeOffRequestsListProps {
  isAdmin: boolean;
  showRequestModal: boolean;
  onCloseRequestModal: () => void;
  onRequestCreated: () => void;
}

export const TimeOffRequestsList = ({ isAdmin, showRequestModal, 
onCloseRequestModal, onRequestCreated }: TimeOffRequestsListProps) => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coverageWarning, setCoverageWarning] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [isAdmin]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await employeeService.getTimeOffRequests({ status: 'pending' });
      } else {
        data = await employeeService.getTimeOffRequests();
      }
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await employeeService.approveTimeOffRequest(id);
      toast.success('Solicitud aprobada');
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await employeeService.rejectTimeOffRequest(id);
      toast.success('Solicitud rechazada');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar');
    }
  };

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) {
      toast.error('Selecciona las fechas');
      return;
    }
    
    setSubmitting(true);
    setCoverageWarning(null);
    
    try {
      // Verificar cobertura primero
      const coverage = await employeeService.checkCoverage({
        startDate,
        endDate,
        employeeId: undefined
      });
      
      if (coverage.hasWarnings) {
        setCoverageWarning(coverage.warnings[0]?.message || 'Riesgo de cobertura baja');
        return;
      }
      
      await employeeService.createTimeOffRequest({ startDate, endDate, notes });
      toast.success('Solicitud enviada');
      setStartDate('');
      setEndDate('');
      setNotes('');
      onCloseRequestModal();
      onRequestCreated();
      loadRequests();
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || 'Error al crear solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 
rounded-full text-xs font-medium">Aprobado</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full 
text-xs font-medium">Rechazado</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 
rounded-full text-xs font-medium">Pendiente</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Solicitudes de 
vacaciones</h2>
        {isAdmin && (
          <span className="text-sm text-gray-500">
            {requests.filter(r => r.status === 'pending').length} pendientes
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 
border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Umbrella size={48} className="mx-auto mb-3 text-gray-300" />
          No hay solicitudes
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-3 
border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{req.employeeName 
|| `Empleado ${req.employee_id}`}</span>
                  {getStatusBadge(req.status)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(req.start_date).toLocaleDateString('es-ES')} - {new 
Date(req.end_date).toLocaleDateString('es-ES')}
                </div>
                {req.notes && <div className="text-xs text-gray-400 
mt-1">{req.notes}</div>}
                {req.coverage_warning && (
                  <div className="text-xs text-orange-600 mt-1 bg-orange-50 p-1 
rounded">
                    ⚠️ Riesgo de cobertura baja
                  </div>
                )}
              </div>
              {isAdmin && req.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg 
transition"
                    title="Aprobar"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg 
transition"
                    title="Rechazar"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de solicitud */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitar 
vacaciones</h3>
            
            {coverageWarning && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 
rounded-lg">
                <p className="text-sm text-orange-800">{coverageWarning}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setCoverageWarning(null)}
                    className="text-sm text-orange-700 underline"
                  >
                    Continuar de todos modos
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 
mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 
mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 
mb-1">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivo de la solicitud..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCloseRequestModal}
                className="px-4 py-2 border border-gray-300 rounded-lg 
hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



