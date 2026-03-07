import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { TopProduct } from '../../services/dashboard.service';

interface BestSellersTableProps {
  period?: string;
  limit?: number;
}

export const BestSellersTable = ({ period = 'week', limit = 5 }: BestSellersTableProps) => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period, limit]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getTopProducts(limit, period);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
        <p className="text-sm text-gray-500 mt-1">
          {period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mes' : 'Hoy'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tendencia
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{product.sales} unidades</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.change > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">+{product.change}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-red-600 font-medium">{product.change}%</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay datos de ventas para este período
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};