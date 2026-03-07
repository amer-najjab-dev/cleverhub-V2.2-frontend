import React from 'react';

interface FilterProps {
  type: 'text' | 'number' | 'select';
  value: string | number | boolean;
  onChange: (value: any) => void;
  options?: { value: string | number | boolean; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

const FilterComponent: React.FC<FilterProps> = ({
  type,
  value,
  onChange,
  options,
  placeholder,
  min,
  max,
  step,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let newValue: any = e.target.value;
    if (type === 'number') {
      newValue = newValue === '' ? '' : Number(newValue);
    } else if (type === 'select' && e.target instanceof HTMLSelectElement) {
      if (options && options.some(opt => typeof opt.value === 'boolean')) {
        newValue = newValue === 'true' ? true : newValue === 'false' ? false : newValue;
      }
    }
    onChange(newValue);
  };

  if (type === 'select') {
    return (
      <select
        value={String(value)}
        onChange={handleChange}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Todos</option>
        {options?.map(opt => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'number') {
    return (
      <input
        type="number"
        value={value === '' ? '' : Number(value)}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      />
    );
  }

  // type === 'text'
  return (
    <input
      type="text"
      value={String(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
    />
  );
};

export default FilterComponent;