import { useState, useEffect, useRef } from 'react';
import { deliveryService } from '../../services/delivery.service';
import { productsService } from '../../services/products.service';
import { Search, X, Check, Plus } from 'lucide-react';
import { Product } from '../../services/products.service';

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
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    note_number: '',
    reception_date: new Date().toISOString().split('T')[0],
    payment_terms: '30 días',
    due_date: '',
    notes: '',
    items: [] as FormItem[]
  });

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await productsService.search(searchTerm);
          setSearchResults(results);
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 50);
        } catch (error) {
          console.error('Error searching products:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    
    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const addItem = () => {
    const newIndex = formData.items.length;
    setSelectedProductIndex(newIndex);
    setActiveSearchIndex(newIndex);
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
      setActiveSearchIndex(null);
    }
  };

  const selectProduct = (product: Product, index: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      product_id: product.id.toString(),
      product_name: product.name,
      product_barcode: product.barcode || '',
      suggested_ppv: product.pricePPV || 0,
      is_selected: true
    };
    setFormData({ ...formData, items: newItems });
    setSearchTerm('');
    setSearchResults([]);
    setSelectedProductIndex(null);
    setActiveSearchIndex(null);
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
      setSearchResults([]);
      setSelectedProductIndex(null);
      setActiveSearchIndex(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar albarán');
    }
  };

  return (
    <div className="space-y-4" ref={formRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Nº BL *</label>
            <input
              type="text"
              required
              value={formData.note_number}
              onChange={(e) => setFormData({ ...formData, note_number: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de albarán"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Fecha Recepción *</label>
            <input
              type="date"
              required
              value={formData.reception_date}
              onChange={(e) => setFormData({ ...formData, reception_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Condiciones de pago</label>
            <input
              type="text"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="Ej: 30 días"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Fecha Vencimiento</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={1}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Registrar Albarán
            </button>
            <button type="button" onClick={addItem} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              + Añadir producto
            </button>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {formData.items.length} producto(s)
          </div>
        </div>
        
        {formData.items.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 w-2/5">Producto</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-12">Qt</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">PPH (€)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">PPV (€)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-28">Caducidad</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Lote</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.items.map((item, index) => (
                  <tr key={index} className={!item.is_selected ? 'bg-blue-50' : ''}>
                    <td className="px-3 py-2">
                      {!item.is_selected ? (
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              ref={selectedProductIndex === index ? inputRef : null}
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onFocus={() => {
                                setSelectedProductIndex(index);
                                setActiveSearchIndex(index);
                              }}
                              placeholder="Escanear o escribir nombre (mínimo 2 caracteres)"
                              className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{item.product_name}</div>
                            <div className="text-xs text-gray-400">Código: {item.product_barcode || 'N/A'}</div>
                          </div>
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemField(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                        min="1"
                        disabled={!item.is_selected}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_cost_pph}
                        onChange={(e) => updateItemField(index, 'unit_cost_pph', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right"
                        placeholder="0.00"
                        disabled={!item.is_selected}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.suggested_ppv}
                        onChange={(e) => updateItemField(index, 'suggested_ppv', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right"
                        placeholder="0.00"
                        disabled={!item.is_selected}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={item.expiration_date}
                        onChange={(e) => updateItemField(index, 'expiration_date', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        disabled={!item.is_selected}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.batch_number}
                        onChange={(e) => updateItemField(index, 'batch_number', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Lote"
                        disabled={!item.is_selected}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {searchResults.length > 0 && activeSearchIndex !== null && (
          <div ref={resultsRef} className="border rounded-lg overflow-hidden shadow-lg">
            <div className="bg-blue-50 px-4 py-2 border-b">
              <h4 className="text-sm font-semibold text-blue-800">
                Resultados de búsqueda ({searchResults.length} productos encontrados)
              </h4>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">PPV</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {searchResults.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectProduct(product, activeSearchIndex)}
                    >
                      <td className="px-4 py-2.5 text-sm">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-400">{product.laboratory || 'Sin laboratorio'}</div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{product.barcode || '-'}</td>
                      <td className="px-4 py-2.5 text-sm text-right font-medium">{product.pricePPV}€</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectProduct(product, activeSearchIndex);
                          }}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isSearching && activeSearchIndex !== null && (
          <div className="p-6 text-center text-gray-500 border rounded-lg bg-gray-50">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Buscando productos...
          </div>
        )}
      </form>
    </div>
  );
};
