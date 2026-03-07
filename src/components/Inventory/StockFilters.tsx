import { Search, Filter, X } from 'lucide-react';

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  zoneFilter: string;
  onZoneChange: (zone: string) => void;
  labFilter: string;
  onLabChange: (lab: string) => void;
  showExpiringOnly: boolean;
  onExpiringToggle: () => void;
  categories: string[];
  zones: string[];
  laboratories: string[];
}

export const StockFilters = ({
  searchQuery,
  onSearchChange,
  onSearch,
  categoryFilter,
  onCategoryChange,
  zoneFilter,
  onZoneChange,
  labFilter,
  onLabChange,
  showExpiringOnly,
  onExpiringToggle,
  categories,
  zones,
  laboratories
}: StockFiltersProps) => {
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Filtro zona */}
        <select
          value={zoneFilter}
          onChange={(e) => onZoneChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas zonas</option>
          {zones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>

        {/* Filtro laboratorio */}
        <select
          value={labFilter}
          onChange={(e) => onLabChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos laboratorios</option>
          {laboratories.map(lab => (
            <option key={lab} value={lab}>{lab}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onExpiringToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showExpiringOnly
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          {showExpiringOnly ? 'Mostrando próximos a caducar' : 'Filtrar próximos a caducar'}
          {showExpiringOnly && (
            <X 
              className="w-4 h-4 ml-2 cursor-pointer hover:text-red-900"
              onClick={(e) => {
                e.stopPropagation();
                onExpiringToggle();
              }}
            />
          )}
        </button>

        <div className="text-sm text-gray-500">
          {searchQuery || categoryFilter || zoneFilter || labFilter || showExpiringOnly ? (
            <span className="text-blue-600">Filtros activos</span>
          ) : (
            <span>Mostrando todos los productos</span>
          )}
        </div>
      </div>
    </div>
  );
};