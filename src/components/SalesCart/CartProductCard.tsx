import { Plus, Minus, AlertTriangle, Pill, Trash2, Percent } from 'lucide-react';
import { CartItem, useCartStore } from '../../store/cart.store';
import { useState } from 'react';
import { useCurrencyFormatter } from '../../utils/formatters';

interface CartProductCardProps {
  product: CartItem;
}

export const CartProductCard = ({ product }: CartProductCardProps) => {
  const { updateQuantity, removeItem, updateProductDiscount } = useCartStore();
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const { formatCurrency } = useCurrencyFormatter();
  
  const isLowStock = product.lowStock || product.stock < 20;
  
  const handleDecrease = () => {
    if (product.quantity > 1) {
      updateQuantity(product.id, product.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (product.quantity < product.stock) {
      updateQuantity(product.id, product.quantity + 1);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  const handleApplyDiscount = () => {
    if (discountInput) {
      const percentage = parseFloat(discountInput);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        updateProductDiscount(product.id, percentage);
        setDiscountInput('');
        setShowDiscountInput(false);
      }
    }
  };

  const handleRemoveDiscount = () => {
    updateProductDiscount(product.id, 0);
  };

  const calculateItemTotal = () => {
    const total = product.pricePPV * product.quantity;
    const discountAmount = total * (product.discountPercentage / 100);
    return total - discountAmount;
  };

  const calculateItemMargin = () => {
    const cost = product.pricePPH * product.quantity;
    const saleTotal = calculateItemTotal();
    return saleTotal - cost;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header con alertas */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Pill className="w-3 h-3 mr-1" />
              {product.category}
            </span>
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            <span className="text-xs text-gray-400">
              Coste: {formatCurrency(product.pricePPH)} | Venta: {formatCurrency(product.pricePPV)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                -{product.discountPercentage}%
              </span>
            )}
          </div>
        </div>
        
        {/* Alertas y botón eliminar */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-end gap-1">
            {isLowStock && (
              <div className="flex items-center text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Stock bajo
              </div>
            )}
            {product.hasInteraction && (
              <div className="flex items-center text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Interacción
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descuento por producto */}
      <div className="mb-3">
        {showDiscountInput ? (
          <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
            <div className="relative flex-1">
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="1"
                className="w-full px-3 py-1 pl-8 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Percent className="absolute left-2 top-1.5 w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={handleApplyDiscount}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Aplicar
            </button>
            <button
              onClick={() => {
                setShowDiscountInput(false);
                setDiscountInput('');
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        ) : product.discountPercentage > 0 ? (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
            <div className="flex items-center text-green-700 text-sm">
              <Percent className="w-4 h-4 mr-1" />
              Descuento aplicado: {product.discountPercentage}%
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Quitar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDiscountInput(true)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Percent className="w-4 h-4 mr-1" />
            Aplicar descuento a este producto
          </button>
        )}
      </div>

      {/* Cantidad y precio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDecrease}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{product.quantity}</span>
          <button 
            onClick={handleIncrease}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-gray-500 text-sm ml-2">× {formatCurrency(product.pricePPV)}</span>
          {product.discountPercentage > 0 && (
            <span className="text-sm text-green-600 ml-2">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
        
        <div className="font-semibold text-lg">
          <div className="text-right">
            {formatCurrency(calculateItemTotal())}
            {product.discountPercentage > 0 && (
              <div className="text-sm text-gray-500 line-through">
                 {formatCurrency(product.pricePPV * product.quantity)}
              </div>
            )}
          </div>
          <div className="text-xs text-green-600 font-normal text-right">
            Margen: {formatCurrency(calculateItemMargin())}
          </div>
        </div>
      </div>

      {/* Advertencia de interacción (si existe) */}
      {product.interactionWarning && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ {product.interactionWarning}
        </div>
      )}
    </div>
  );
};
