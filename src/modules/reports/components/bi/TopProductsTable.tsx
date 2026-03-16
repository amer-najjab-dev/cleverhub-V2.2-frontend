import { useCurrencyFormatter } from '../../../../utils/formatters';

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
}

export const TopProductsTable = ({ products }: TopProductsProps) => {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Productos</h3>
      <p className="text-sm text-gray-600 mb-4">Los más vendidos de la período</p>
      
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
                <td className="py-3 px-4 text-sm text-gray-900">{product.quantity} u.</td>
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