import React, { useState } from 'react';
import styles from './ProductSearchDropdown.module.css';

interface ProductSearchDropdownProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  initialFilter?: string;
  placeholder?: string;
}

const ProductSearchDropdown: React.FC<ProductSearchDropdownProps> = ({
  onSearch,
  onFilterChange,
  initialFilter = 'Todos',
  placeholder = 'Buscar productos...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters = [
    'Todos',
    'Medicamentos', 
    'Dermo',
    'Solar',
    'STOCK BAJO',
    'MÁS VENDIDOS'
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
    setIsDropdownOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.dropdownWrapper}>
        <button
          className={styles.dropdownButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          type="button"
          aria-expanded={isDropdownOpen}
        >
          {selectedFilter}
          <span className={styles.dropdownArrow}>▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {filters.map((filter) => (
              <button
                key={filter}
                className={`${styles.dropdownItem} ${selectedFilter === filter ? styles.active : ''}`}
                onClick={() => handleFilterSelect(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearchDropdown;
