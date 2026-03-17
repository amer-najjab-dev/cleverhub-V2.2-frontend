import { useState } from 'react';
import { useCurrencyFormatter } from '../../../../utils/formatters';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface TopProductsProps {
  products: Array<{
    id: number;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
    margin: number;
    marginPercentage: number;
  }>;
  period?: string;
  startDate?: string;
  endDate?: string;
  onPeriodChange?: (period: string) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export const TopProductsTable = ({ 
  products, 
  period = 'week',
  startDate: initialStartDate,
  endDate: initialEndDate,
  onPeriodChange,
  onDateRangeChange 
}: TopProductsProps) => {
  const { formatCurrency } = useCurrencyFormatter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  const getPeriodText = () => {
    if (period === 'custom' && startDate && endDate) {
      return `del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}`;
    }
    const periods = {
      week: 'última semana',
      month: 'último mes',
      quarter: 'último trimestre'
    };
    return periods[period as keyof typeof periods] || 'período seleccionado';
  };

  const handlePeriodSelect = (selectedPeriod: string) => {
    onPeriodChange?.(selectedPeriod);
    setIsOpen(false);
    setShowDatePicker(false);
  };

  const handleApplyDateRange = () => {
    if (startDate && endDate && onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
      setShowDatePicker(false);
      setIsOpen(false);
    }
  };

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500">No hay datos de productos para {getPeriodText()}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Productos</h3>
          <p className="text-sm text-gray-600">Los más vendidos {getPeriodText()}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Calendar className="w-4 h-4 text-gray-600" />
            <span>Período</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => handlePeriodSelect('week')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  Última semana
                </button>
                <button
                  onClick={() => handlePeriodSelect('month')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  Último mes
                </button>
                <button
                  onClick={() => handlePeriodSelect('quarter')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  Último trimestre
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowDatePicker(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  Personalizar fechas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDatePicker && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleApplyDateRange}
              disabled={!startDate || !endDate}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Producto</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Categoría</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cantidad</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">C. A.</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Marge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{product.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{product.category || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{product.quantity} u.</td>
                <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(product.revenue)}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`font-medium ${product.marginPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.marginPercentage >= 0 ? '+' : ''}{product.marginPercentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};