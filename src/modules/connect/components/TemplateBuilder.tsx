import React, { useState } from 'react';
import { 
  Save, 
  X, 
  Plus,
  Search
} from 'lucide-react';
import { connectService } from '../services/connect.service';
import { productsService } from '../../../services/products.service';

interface TemplateBuilderProps {
  template?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'promotion');
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [showVariables, setShowVariables] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const availableVariables = [
    '{{nombre_cliente}}',
    '{{puntos_actuales}}',
    '{{producto_sugerido}}',
    '{{fecha_vencimiento_lote}}',
    '{{enlace_desinscripcion}}'
  ];

  const searchProducts = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await productsService.search(query);
      setSearchResults(response.slice(0, 5));
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const insertVariable = (variable: string) => {
    setContent(content + ' ' + variable);
    if (!variables.includes(variable)) {
      setVariables([...variables, variable]);
    }
  };

  const insertProductName = (productName: string) => {
    setContent(content + ' ' + productName);
    setProductSearch('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!name || !content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (template?.id) {
        await connectService.updateTemplate(template.id, {
          name,
          content,
          category,
          variables
        });
      } else {
        await connectService.createTemplate({
          name,
          content,
          category,
          variables,
          status: 'draft'
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          {template ? 'Modifier le modèle' : 'Nouveau modèle'}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du modèle *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Promotion produits solaires"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="promotion">Promotion</option>
            <option value="reactivation">Réactivation</option>
            <option value="points">Points</option>
            <option value="expiring">Expiration</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du message *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Bonjour {{nombre_cliente}}, nous avons une offre spéciale pour vous..."
          />
        </div>

        <div>
          <button
            onClick={() => setShowVariables(!showVariables)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Insérer une variable
          </button>

          {showVariables && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 mb-2">VARIABLES DISPONIBLES</h4>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-blue-50 hover:border-blue-300"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher un produit
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                searchProducts(e.target.value);
              }}
              placeholder="Nom du produit..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => insertProductName(product.name)}
                  className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.laboratory || ''}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};