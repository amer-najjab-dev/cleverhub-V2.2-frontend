import { useState, useEffect, useRef } from 'react';
import { deliveryService } from '../../services/delivery.service';
import { productsService } from '../../services/products.service';
import { Search, X, Check } from 'lucide-react';

interface DeliveryFormProps {
  supplierId: string;
  onSuccess?: () => void;
}

interface FormItem {
  product_id: string;
  product_name: string;
  product_barcode: string;
  quantity: number;
  unit_cost_pph: number;
  suggested_ppv: number;
  expiration_date: string;
  batch_number: string;
  is_selected: boolean;
}

export const DeliveryForm = ({ supplierId, onSuccess }: DeliveryFormProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    note_number: '',
    reception_date: new Date().toISOString().split('T')[0],
    payment_terms: '30 días',
    due_date: '',
    notes: '',
    items: [] as FormItem[]
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await productsService.search(searchTerm);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error searching products:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };
    
    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const addItem = () => {
    setSelectedProductIndex(formData.items.length);
    setFormData({
      ...formData,
      items: [...formData.items, { 
        product_id: '', 
        product_name: '',
        product_barcode: '',
        quantity: 1, 
        unit_cost_pph: 0, 
        suggested_ppv: 0,
        expiration_date: '', 
        batch_number: '',
        is_selected: false
      }]
    });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    if (selectedProductIndex === index) {
      setSelectedProductIndex(null);
    }
  };

  const selectProduct = (product: any, index: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      product_id: product.id,
      product_name: product.name,
      product_barcode: product.barcode || '',
      suggested_ppv: product.pricePPV || 0,
      is_selected: true
    };
    setFormData({ ...formData, items: newItems });
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedProductIndex(null);
  };

  const updateItemField = (index: number, field: keyof FormItem, value: any) => {
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index], [field]: value };
    newItems[index] = updatedItem;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.note_number) {
      alert('El número de BL es obligatorio');
      return;
    }
    if (formData.items.length === 0) {
      alert('Debe añadir al menos un producto');
      return;
    }
    for (const item of formData.items) {
      if (!item.is_selected) {
        alert('Debe seleccionar un producto válido');
        return;
      }
      if (item.quantity <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
      }
      if (item.unit_cost_pph <= 0) {
        alert('El precio de compra (PPH) debe ser mayor a 0');
        return;
      }
      if (!item.expiration_date) {
        alert('La fecha de caducidad es obligatoria');
        return;
      }
    }

    try {
      await deliveryService.registerDelivery({
        note_number: formData.note_number,
        supplier_id: supplierId,
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
        reception_date: new Date().toISOString().split('T')[0],
        payment_terms: '30 días',
        due_date: '',
        notes: '',
        items: []
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar albarán');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nº BL *</label>
            <input
              type="text"
              required
              value={formData.note_number}
              onChange={(e) => setFormData({ ...formData, note_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Número de albarán"
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
              placeholder="Ej: 30 días"
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
            <button type="button" onClick={addItem} className="text-blue-600 text-sm hover:text-blue-700">
              + Añadir producto
            </button>
          </div>
          
          {formData.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Qt</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">PPH (€)</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">PPV (€)</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Caducidad</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Lote</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2 align-top">
                        {!item.is_selected ? (
                          <div className="relative" ref={searchRef}>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                ref={selectedProductIndex === index ? inputRef : null}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setSelectedProductIndex(index)}
                                placeholder="Escanear o escribir nombre (mínimo 2 caracteres)"
                                className="w-full pl-8 pr-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {showDropdown && searchResults.length > 0 && selectedProductIndex === index && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => selectProduct(product, index)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex justify-between items-center"
                                  >
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-gray-500">Código: {product.barcode || 'N/A'}</div>
                                    </div>
                                    <div className="text-xs text-gray-400">{product.pricePPV}€</div>
                                  </button>
                                ))}
                              </div>
                            )}
                            {isSearching && selectedProductIndex === index && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                                Buscando...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{item.product_name}</div>
                              <div className="text-xs text-gray-500">Código: {item.product_barcode || 'N/A'}</div>
                            </div>
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemField(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-center text-sm"
                          min="1"
                          disabled={!item.is_selected}
                        />
                       </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_cost_pph}
                          onChange={(e) => updateItemField(index, 'unit_cost_pph', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded text-right text-sm"
                          placeholder="0.00"
                          disabled={!item.is_selected}
                        />
                       </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={item.suggested_ppv}
                          onChange={(e) => updateItemField(index, 'suggested_ppv', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded text-right text-sm"
                          placeholder="0.00"
                          disabled={!item.is_selected}
                        />
                       </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="date"
                          value={item.expiration_date}
                          onChange={(e) => updateItemField(index, 'expiration_date', e.target.value)}
                          className="w-32 px-2 py-1 border rounded text-sm"
                          disabled={!item.is_selected}
                        />
                       </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          value={item.batch_number}
                          onChange={(e) => updateItemField(index, 'batch_number', e.target.value)}
                          className="w-28 px-2 py-1 border rounded text-sm"
                          placeholder="Lote"
                          disabled={!item.is_selected}
                        />
                       </td>
                      <td className="px-3 py-2 align-top text-center">
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Registrar Albarán
          </button>
        </div>
      </form>
    </div>
  );
};
