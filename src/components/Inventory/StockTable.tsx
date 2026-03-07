import { useState } from 'react';
import { Edit } from 'lucide-react';
import { useCurrencyFormatter } from '../../utils/formatters';
import { InventoryProduct } from '../../services/inventory.service';

interface StockTableProps {
  products: InventoryProduct[];
  loading?: boolean;
  onEdit: (product: InventoryProduct) => void;
}

export const StockTable = ({ products, loading, onEdit }: StockTableProps) => {
  const [sortField, setSortField] = useState<keyof InventoryProduct>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { formatCurrency } = useCurrencyFormatter();

  const handleSort = (field: keyof InventoryProduct) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { class: 'bg-red-600 text-white', text: 'Caducado' };
    if (diffDays < 90) return { class: 'bg-red-500 text-white', text: `${diffDays} días` };
    if (diffDays < 180) return { class: 'bg-orange-400 text-white', text: `${diffDays} días` };
    return { class: 'bg-gray-100 text-gray-700', text: expiry.toLocaleDateString() };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('name')}>
                Producto {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('stock')}>
                Stock {sortField === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPH</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caducidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code barre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code 2</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedProducts.map((product) => {
              const expiryStatus = getExpiryStatus(product.expiryDate);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.dosage && (
                      <div className="text-xs text-gray-500">{product.dosage}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.stock}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.reserved}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <span className={product.available < 5 ? 'text-orange-600 font-bold' : 'text-green-600'}>
                      {product.available}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.ordered}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(product.pricePPH)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(product.pricePPV)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.zone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.class}`}>
                      {expiryStatus.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{product.barcode1}</td>
                  <td className="px-4 py-3 text-sm font-mono">{product.barcode2 || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar stock"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {products.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No hay productos en el inventario
        </div>
      )}
    </div>
  );
};