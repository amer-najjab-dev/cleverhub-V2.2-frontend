import React from 'react';
import { Search, X } from 'lucide-react';

interface ProductFiltersProps {
  laboratories: string[];
  categories: string[];
  selectedLab: string;
  selectedCategory: string;
  searchTerm: string;
  onLabChange: (lab: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  laboratories,
  categories,
  selectedLab,
  selectedCategory,
  searchTerm,
  onLabChange,
  onCategoryChange,
  onSearchChange,
  onClearFilters
}) => {
  const hasFilters = selectedLab || selectedCategory || searchTerm;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filtro por laboratorio */}
        <select
          value={selectedLab}
          onChange={(e) => onLabChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Tous les laboratoires</option>
          {laboratories.map((lab) => (
            <option key={lab} value={lab}>{lab}</option>
          ))}
        </select>

        {/* Filtro por categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Botón para limpiar filtros */}
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  );
};