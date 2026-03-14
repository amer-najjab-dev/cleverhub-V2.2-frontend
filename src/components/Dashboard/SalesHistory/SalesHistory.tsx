import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, CheckCircle, Clock as ClockIcon, AlertCircle } from 'lucide-react';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { salesService, Sale } from '../../../services/sales.service';

export const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 10,
        page: 1
      };
      
      const response = await salesService.getAll(params);
      
      // La respuesta ahora tiene la estructura { success, data, meta }
      if (response && response.success && Array.isArray(response.data)) {
        setSales(response.data);
      } 
      else if (Array.isArray(response)) {
        // Fallback por si el mapeo no se aplicó correctamente
        setSales(response);
      }
      else {
        console.warn('Formato de respuesta inesperado:', response);
        setError('No se pudieron cargar las ventas');
        setSales([]);
      }
      
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
      setError('Error al conectar con el servidor');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
    } catch (err) {
      return 'Error al formatear fecha';
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) {
      return 'bg-green-100 text-green-800';
    }
    if (['partial', 'parcial'].includes(statusLower)) {
      return 'bg-amber-100 text-amber-800';
    }
    if (['pending', 'pendiente'].includes(statusLower)) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (['partial', 'parcial'].includes(statusLower)) {
      return <ClockIcon className="w-4 h-4" />;
    }
    if (['pending', 'pendiente'].includes(statusLower)) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  const getPaymentStatusText = (status: string | undefined) => {
    if (!status) return 'Desconocido';
    
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) return 'Pagado';
    if (['partial', 'parcial'].includes(statusLower)) return 'Parcial';
    if (['pending', 'pendiente'].includes(statusLower)) return 'Pendiente';
    return status;
  };

  const getPaymentMethodText = (method: string | undefined) => {
    if (!method) return 'No especificado';
    
    const methodLower = method.toLowerCase();
    if (['cash', 'efectivo'].includes(methodLower)) return 'Efectivo';
    if (['credit card', 'tarjeta'].includes(methodLower)) return 'Tarjeta';
    if (['credit', 'crédito'].includes(methodLower)) return 'Crédito';
    if (['bank transfer', 'transferencia'].includes(methodLower)) return 'Transferencia';
    if (['bank cheque', 'cheque'].includes(methodLower)) return 'Cheque';
    if (['mixed', 'mixto'].includes(methodLower)) return 'Mixto';
    return method;
  };

  const getClientName = (sale: Sale): string => {
    if (sale.client) {
      return `${sale.client.firstName || ''} ${sale.client.lastName || ''}`.trim() || 'Cliente';
    }
    return sale.clientId ? `Cliente #${sale.clientId}` : 'Cliente no registrado';
  };

  const getUserName = (sale: Sale): string => {
    if (sale.user) {
      return sale.user.fullName || `Usuario #${sale.userId}`;
    }
    return `Usuario #${sale.userId}`;
  };

  const handleViewFullHistory = () => {
    navigate('/sales/history');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historial de Ventas Recientes</h3>
          <p className="text-sm text-gray-600 mt-1">Últimas 10 ventas registradas en el sistema</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchRecentSales}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors flex items-center gap-1"
            title="Actualizar lista de ventas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {Array.isArray(sales) && sales.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID Venta</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha/Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Importe</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Método Pago</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm font-medium text-blue-700">
                        {sale.saleNumber || `V-${sale.id}`}
                      </div>
                      <div className="text-xs text-gray-500">ID: {sale.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {formatDate(sale.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {getClientName(sale)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-blue-700">
                            {sale.user?.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {getUserName(sale)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total || 0)}
                        </span>
                        {sale.discountAmount && sale.discountAmount > 0 && (
                          <span className="text-xs text-green-600 mt-0.5 font-medium">
                            -{formatCurrency(sale.discountAmount)} desc
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">
                        {getPaymentMethodText(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.paymentStatus)}`}>
                        {getPaymentStatusIcon(sale.paymentStatus)}
                        <span className="ml-1.5 whitespace-nowrap">
                          {getPaymentStatusText(sale.paymentStatus)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Mostrando {sales.length} ventas recientes</span>
                <button 
                  onClick={handleViewFullHistory}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver historial completo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">No hay ventas recientes</h4>
            <p className="text-gray-500 mb-4">
              {error ? 'Error al cargar las ventas' : 'No se encontraron ventas en el sistema'}
            </p>
            <button 
              onClick={fetchRecentSales}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};