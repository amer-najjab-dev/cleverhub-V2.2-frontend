import { useState } from 'react';
import { X } from 'lucide-react';
import { InventoryProduct } from '../../services/inventory.service';

interface EditStockModalProps {
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, data: any) => void;
}

export const EditStockModal = ({ product, isOpen, onClose, onSave }: 
EditStockModalProps) => {
  const [stock, setStock] = useState(product?.stock || 0);
  const [ordered, setOrdered] = useState(product?.ordered || 0);
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate || '');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.id, {
      newStock: stock,
      newOrdered: ordered,
      newExpiryDate: expiryDate,
      reason,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] 
overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b 
border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ajustar Stock</h3>
          <button onClick={onClose} className="text-gray-400 
hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{product.name}</div>
              {product.dosage && (
                <div className="text-sm text-gray-600">{product.dosage}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock actual
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {product.stock} unidades
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo stock
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pedido
            </label>
            <input
              type="number"
              min="0"
              value={ordered}
              onChange={(e) => setOrdered(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de caducidad
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del ajuste
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar motivo</option>
              <option value="recepcion">Recepción de pedido</option>
              <option value="venta">Venta</option>
              <option value="inventario">Ajuste de inventario</option>
              <option value="devolucion">Devolución</option>
              <option value="caducidad">Producto caducado</option>
              <option value="error">Error de inventario</option>
              <option value="rotura">Rotura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
              placeholder="Información adicional..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 font-medium"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
