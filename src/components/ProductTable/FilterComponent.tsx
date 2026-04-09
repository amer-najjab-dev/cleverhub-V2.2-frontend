import React, { useState, useEffect } from 'react';

interface FilterProps {
  type: 'text' | 'number' | 'select';
  value: string | number | boolean;
  onChange: (value: any) => void;
  options?: { value: string | number | boolean; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  debounce?: number;
  minLength?: number;
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
  debounce = 0,
  minLength = 0,
}) => {
  const [localValue, setLocalValue] = useState<string>(String(value));
  
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);
  
  useEffect(() => {
    if (type !== 'text') return;
    
    const timer = setTimeout(() => {
      const strValue = String(localValue);
      if (minLength === 0 || strValue.length >= minLength || strValue.length === 0) {
        if (strValue !== String(value)) {
          onChange(strValue);
        }
      }
    }, debounce);
    
    return () => clearTimeout(timer);
  }, [localValue, debounce, minLength, type, value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let newValue: any = e.target.value;
    if (type === 'number') {
      newValue = newValue === '' ? '' : Number(newValue);
    } else if (type === 'select' && e.target instanceof HTMLSelectElement) {
      if (options && options.some(opt => typeof opt.value === 'boolean')) {
        newValue = newValue === 'true' ? true : newValue === 'false' ? false : newValue;
      }
    }
    
    if (type === 'text') {
      setLocalValue(newValue);
    } else {
      onChange(newValue);
    }
  };

  const baseClassName = "w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

  if (type === 'select') {
    return (
      <select
        value={String(value)}
        onChange={handleChange}
        className={baseClassName}
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
        className={baseClassName}
      />
    );
  }

  // type === 'text'
  return (
    <div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={baseClassName}
      />
      {minLength > 0 && localValue.length > 0 && localValue.length < minLength && (
        <p className="text-xs text-amber-600 mt-1">Mínimo {minLength} caracteres</p>
      )}
    </div>
  );
};

export default FilterComponent;
