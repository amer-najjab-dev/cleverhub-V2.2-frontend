import { useState, useEffect } from 'react';
import { deliveryService } from '../../services/delivery.service';
import { productsService } from '../../services/products.service';

interface DeliveryFormProps {
  supplierId: string;
  onSuccess?: () => void;
}

interface FormItem {
  product_id: string;
  quantity: number;
  unit_cost_pph: number;
  expiration_date: string;
  batch_number: string;
}

export const DeliveryForm = ({ supplierId, onSuccess }: DeliveryFormProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    note_number: '',
    bl_number: '',
    reception_date: new Date().toISOString().split('T')[0],
    payment_terms: '30 días',
    due_date: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_cost_pph: 0, expiration_date: '', batch_number: '' }] as FormItem[]
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, unit_cost_pph: 0, expiration_date: '', batch_number: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deliveryService.registerDelivery({
        note_number: formData.note_number,
        supplier_id: supplierId,
        bl_number: formData.bl_number,
        reception_date: formData.reception_date,
        payment_terms: formData.payment_terms,
        due_date: formData.due_date,
        notes: formData.notes,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
          unit_cost_pph: item.unit_cost_pph,
          expiration_date: item.expiration_date,
          batch_number: item.batch_number
        }))
      });
      alert('Albarán registrado correctamente');
      setFormData({
        note_number: '',
        bl_number: '',
        reception_date: new Date().toISOString().split('T')[0],
        payment_terms: '30 días',
        due_date: '',
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_cost_pph: 0, expiration_date: '', batch_number: '' }]
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar albarán');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Registrar Albarán de Entrada</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nº Albarán *</label>
            <input
              type="text"
              required
              value={formData.note_number}
              onChange={(e) => setFormData({ ...formData, note_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nº BL</label>
            <input
              type="text"
              value={formData.bl_number}
              onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Recepción *</label>
            <input
              type="date"
              required
              value={formData.reception_date}
              onChange={(e) => setFormData({ ...formData, reception_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condiciones de pago</label>
            <input
              type="text"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Vencimiento</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Productos</h4>
            <button type="button" onClick={addItem} className="text-blue-600 text-sm">+ Añadir producto</button>
          </div>
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-6 gap-2 p-2 border rounded-lg">
                <select
                  required
                  value={item.product_id}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].product_id = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="col-span-2 px-2 py-1 border rounded"
                >
                  <option value="">Producto</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].quantity = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio compra"
                  value={item.unit_cost_pph}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].unit_cost_pph = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="date"
                  value={item.expiration_date}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].expiration_date = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  placeholder="Lote"
                  value={item.batch_number}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].batch_number = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="px-2 py-1 border rounded"
                />
                <button type="button" onClick={() => removeItem(index)} className="text-red-500">✖</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Registrar Albarán
        </button>
      </form>
    </div>
  );
};
