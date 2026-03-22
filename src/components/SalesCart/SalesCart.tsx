import { CartProductCard } from './CartProductCard';
import { useCartStore } from '../../store/cart.store';
import { ShoppingCart, X } from 'lucide-react';
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {customer.first_name?.charAt(0).toUpperCase()}
              {customer.last_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-blue-900">
                {customer.first_name} {customer.last_name}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
          {onClearCustomer && (
            <button
              onClick={onClearCustomer}
              className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
              title="Quitar cliente"
            >
              <X className="w-3.5 h-3.5 text-blue-600" />
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