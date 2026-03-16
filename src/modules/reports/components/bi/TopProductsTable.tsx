import React from 'react';
// Eliminados TrendingUp y TrendingDown que no se usaban
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface TopProductsTableProps {
  products: Array<{
    id: number;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
    margin: number;
    marginPercentage: number;
  }>;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const getMarginColor = (percentage: number) => {
    if (percentage >= 30) return 'text-green-600 bg-green-50';
    if (percentage >= 20) return 'text-blue-600 bg-blue-50';
    if (percentage >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top 10 Produits</h3>
        <p className="text-sm text-gray-500 mt-1">Les plus vendus de la période</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Chiffre d'affaires</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Marge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">{product.quantity} u.</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(product.revenue)}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getMarginColor(product.marginPercentage)}`}>
                    {typeof product.marginPercentage === 'number' 
                    ? `${product.marginPercentage >= 0 ? '+' : ''}${product.marginPercentage.toFixed(1)}%` 
                    : '0.0%'}
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