import { CartProductCard } from './CartProductCard';
import { useCartStore } from '../../store/cart.store';
import { ShoppingCart, User, X } from 'lucide-react';
import { Client } from '../../services/clients.service';
import { useCurrencyFormatter } from '../../utils/formatters';

interface SalesCartProps {
  customer?: Client | null;
  onClearCustomer?: () => void;
}



export const SalesCart = ({ customer, onClearCustomer }: SalesCartProps) => {
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const { formatCurrency } = useCurrencyFormatter();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrito vacío</h3>
        <p className="text-gray-500 mb-4">Añade productos para comenzar una venta</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Buscar productos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Mostrar cliente si existe */}
      {customer && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-blue-800">Cliente:</span>
              <span className="ml-2 text-sm text-gray-700">
                {customer.name} {customer.last_name ? ` ${customer.last_name}` : ''}
                {customer.phone && ` - ${customer.phone}`}
              </span>
            </div>
          </div>
          {onClearCustomer && (
            <button
              onClick={onClearCustomer}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
              title="Quitar cliente"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Carrito de Ventas</h2>
        <div className="text-sm text-gray-500">
          {items.length} producto{items.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Lista de productos */}
      <div className="space-y-3">
        {items.map((product) => (
          <CartProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Total del carrito */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Subtotal</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Todos los precios incluyen IVA. Stock actualizado en tiempo real.
        </p>
      </div>
    </div>
  );
};