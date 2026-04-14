import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, User, CheckCircle, Clock as ClockIcon, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { salesService, Sale } from '../../../services/sales.service';

interface SalesHistoryProps {
  limit?: number;
  showPagination?: boolean;
  onViewFullHistory?: () => void;
}

export const SalesHistory = ({ limit: initialLimit = 10, showPagination = false, onViewFullHistory }: SalesHistoryProps) => {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(initialLimit);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    fetchRecentSales();
  }, [limit]);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit,
        page: 1
      };
      
      const response = await salesService.getAll(params);
      
      if (response && response.success && Array.isArray(response.data)) {
        setSales(response.data);
      } else if (Array.isArray(response)) {
        setSales(response);
      } else {
        console.warn('Formato de respuesta inesperado:', response);
        setError(t('salesHistory.unexpected_format'));
        setSales([]);
      }
      
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
      setError(t('salesHistory.connection_error'));
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (saleId: number) => {
    setExpandedRowId(expandedRowId === saleId ? null : saleId);
  };

  const getProductItems = (sale: Sale) => {
    return sale.items?.map((item: any) => ({
      id: item.id,
      productName: item.product?.name || t('salesHistory.product_unavailable'),
      quantity: item.quantity,
      unitPricePPV: item.unitPricePPV || 0,
      total: item.total || 0
    })) || [];
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return t('salesHistory.date_unavailable');
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return t('salesHistory.invalid_date');
      return dateObj.toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return t('salesHistory.date_format_error');
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
    if (!status) return t('salesHistory.unknown');
    const statusLower = status.toLowerCase();
    if (['paid', 'pagado'].includes(statusLower)) return t('salesHistory.paid');
    if (['partial', 'parcial'].includes(statusLower)) return t('salesHistory.partial');
    if (['pending', 'pendiente'].includes(statusLower)) return t('salesHistory.pending');
    return status;
  };

  const getPaymentMethodText = (method: string | undefined) => {
    if (!method) return t('salesHistory.not_specified');
    const methodLower = method.toLowerCase();
    if (['cash', 'efectivo'].includes(methodLower)) return t('salesHistory.cash');
    if (['credit card', 'tarjeta'].includes(methodLower)) return t('salesHistory.card');
    if (['credit', 'crédito'].includes(methodLower)) return t('salesHistory.credit');
    if (['bank transfer', 'transferencia'].includes(methodLower)) return t('salesHistory.transfer');
    if (['bank cheque', 'cheque'].includes(methodLower)) return t('salesHistory.check');
    if (['mixed', 'mixto'].includes(methodLower)) return t('salesHistory.mixed');
    return method;
  };

  const getClientName = (sale: Sale): string => {
    if (sale.client) {
      return `${sale.client.first_name || ''} ${sale.client.last_name || ''}`.trim() || t('salesHistory.client');
    }
    return sale.clientId ? `${t('salesHistory.client')} #${sale.clientId}` : t('salesHistory.unregistered_client');
  };

  const getUserName = (sale: Sale): string => {
    if (sale.user) return sale.user.fullName || `${t('salesHistory.user')} #${sale.userId}`;
    return `${t('salesHistory.user')} #${sale.userId}`;
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
          <h3 className="text-lg font-semibold text-gray-900">{t('salesHistory.title')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('salesHistory.subtitle')}</p>
        </div>
        
        {showPagination && (
          <div className="flex items-center gap-3">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 {t('salesHistory.sales')}</option>
              <option value={50}>50 {t('salesHistory.sales')}</option>
              <option value={100}>100 {t('salesHistory.sales')}</option>
            </select>
            <button
              onClick={fetchRecentSales}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh')}
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.sale_id')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.date_time')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.client')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.user')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.amount')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.payment_method')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('salesHistory.status')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((sale) => {
                const isExpanded = expandedRowId === sale.id;
                const items = getProductItems(sale);
                const discountAmount = sale.discountAmount || 0;
                
                return (
                  <React.Fragment key={sale.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleRow(sale.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm font-medium text-blue-700">
                          {sale.saleNumber || `V-${sale.id}`}
                        </div>
                        <div className="text-xs text-gray-500">{t('salesHistory.id')}: {sale.id}</div>
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
                          {discountAmount > 0 && (
                            <span className="text-xs text-green-600 mt-0.5">
                              -{formatCurrency(discountAmount)} {t('salesHistory.discount')}
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
                      <td className="py-3 px-4">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && items.length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-4">
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {t('salesHistory.sale_products')}
                            </h4>
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-300">
                                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">{t('salesHistory.product')}</th>
                                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">{t('salesHistory.quantity')}</th>
                                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">{t('salesHistory.unit_price')}</th>
                                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">{t('salesHistory.total')}</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-2 px-3 text-sm text-gray-900">{item.productName}</td>
                                    <td className="py-2 px-3 text-sm text-gray-900">{item.quantity}</td>
                                    <td className="py-2 px-3 text-sm text-gray-900">{formatCurrency(item.unitPricePPV)}</td>
                                    <td className="py-2 px-3 text-sm text-gray-900">{formatCurrency(item.total)}</td>
                                   </tr>
                                ))}
                              </tbody>
                             </table>
                          </div>
                         </td>
                       </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
           </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {t('salesHistory.no_sales')}
          </div>
        )}
      </div>

      {onViewFullHistory && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onViewFullHistory}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('salesHistory.view_full_history')} →
          </button>
        </div>
      )}
    </div>
  );
};
