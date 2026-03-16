import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, CheckCircle, Clock as ClockIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { salesService, Sale } from '../../../services/sales.service';

interface SalesHistoryProps {
  limit?: number;
  showPagination?: boolean;
  onViewFullHistory?: () => void;
}

export const SalesHistory = ({ limit: initialLimit = 10, showPagination = false, onViewFullHistory }: SalesHistoryProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(initialLimit);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    fetchRecentSales();
  }, [limit, page]);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit,
        page
      };
      
      const response = await salesService.getAll(params);
      
      if (response && response.success && Array.isArray(response.data)) {
        setSales(response.data);
      } else if (Array.isArray(response)) {
        setSales(response);
      } else {
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
      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      return dateObj.toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Error al formatear fecha';
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) return 'bg-green-100 text-green-800';
    if (['partial', 'parcial'].includes(statusLower)) return 'bg-amber-100 text-amber-800';
    if (['pending', 'pendiente'].includes(statusLower)) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) return <CheckCircle className="w-4 h-4" />;
    if (['partial', 'parcial'].includes(statusLower)) return <ClockIcon className="w-4 h-4" />;
    if (['pending', 'pendiente'].includes(statusLower)) return <AlertCircle className="w-4 h-4" />;
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
    if (sale.user) return sale.user.fullName || `Usuario #${sale.userId}`;
    return `Usuario #${sale.userId}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
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
          <p className="text-sm text-gray-600 mt-1">Últimas ventas registradas en el sistema</p>
        </div>
        
        {showPagination && (
          <div className="flex items-center gap-3">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 ventas</option>
              <option value={50}>50 ventas</option>
              <option value={100}>100 ventas</option>
            </select>
            <button
              onClick={fetchRecentSales}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {sales.length > 0 ? (
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
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDate(sale.createdAt)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{getClientName(sale)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-blue-700">
                          {sale.user?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{getUserName(sale)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.total || 0)}
                      </span>
                      {sale.discountAmount && sale.discountAmount > 0 && (
                        <span className="text-xs text-green-600 mt-0.5">
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
                      <span className="ml-1.5">{getPaymentStatusText(sale.paymentStatus)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay ventas recientes
          </div>
        )}
      </div>

      {onViewFullHistory && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onViewFullHistory}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver historial completo →
          </button>
        </div>
      )}
    </div>
  );
};
