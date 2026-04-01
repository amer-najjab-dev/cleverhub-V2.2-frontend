import { useEffect, useState } from 'react';
import { adminService, Subscription } from '../../services/admin.service';
import { format } from 'date-fns';

export const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [extendDays, setExtendDays] = useState(7);
  const [extendReason, setExtendReason] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await adminService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

// Eliminar import de 'es' si no se usa
// import { es } from 'date-fns/locale';


  const handleExtendCourtesy = async () => {
    if (!selectedPharmacy) return;
    try {
      await adminService.extendCourtesy({
        pharmacyId: selectedPharmacy,
        days: extendDays,
        reason: extendReason,
      });
      alert('Cortesía extendida exitosamente');
      setShowExtendModal(false);
      loadSubscriptions();
    } catch (error) {
      console.error('Error extending courtesy:', error);
      alert('Error al extender la cortesía');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      TRIAL: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      GRACE_PERIOD: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Suscripciones</h1>
          <p className="text-gray-600 mt-1">Administra las licencias de todas las farmacias</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmacia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de expiración
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sub.pharmacy?.name || `Farmacia ID: ${sub.pharmacy_id}`}
                      </div>
                      <div className="text-sm text-gray-500">{sub.pharmacy?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {format(new Date(sub.start_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {format(new Date(sub.end_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPharmacy(sub.pharmacy_id);
                          setShowExtendModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Extender
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de extensión */}
        {showExtendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Extender cortesía</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días a extender
                  </label>
                  <input
                    type="number"
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
focus:border-transparent"
                    placeholder="Ej: Cortesía por buen comportamiento"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExtendCourtesy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Extender
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

