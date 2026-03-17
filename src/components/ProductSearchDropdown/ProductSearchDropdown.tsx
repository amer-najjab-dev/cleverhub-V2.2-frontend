import { forwardRef, useState, useEffect } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import { Product } from '../../services/products.service';

interface ProductSearchDropdownProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onSelectProduct: (product: Product) => void;
  placeholder?: string;
  searchResults: Product[];
  isSearching: boolean;
}

const ProductSearchDropdown = forwardRef<HTMLInputElement, ProductSearchDropdownProps>(
  ({ onSearch, onFilterChange, onSelectProduct, placeholder, searchResults, isSearching }, ref) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Todos');

    useEffect(() => {
      const debounceTimer = setTimeout(() => {
        if (query.length >= 3) {
          onSearch(query);
          setShowResults(true);
        } else {
          setShowResults(false);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    }, [query, onSearch]);

    const handleFilterChange = (filter: string) => {
      setSelectedFilter(filter);
      onFilterChange(filter);
    };

    const handleSelect = (product: Product) => {
      onSelectProduct(product);
      setQuery('');
      setShowResults(false);
    };

    const filters = ['Todos', 'Medicamentos', 'Dermo', 'Parafarmacia'];

    return (
      <div className="relative w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={ref}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              onFocus={() => query.length >= 3 && setShowResults(true)}
              placeholder={placeholder || "Buscar productos..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {filters.map(filter => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown resultados */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Buscando...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <button
                  key={product.id}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(product)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {product.category || 'General'}
                    </span>
                    <span className="ml-2">
                      Stock: {product.stock} | Precio: {product.pricePPV} MAD
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ProductSearchDropdown.displayName = 'ProductSearchDropdown';

export default ProductSearchDropdown;