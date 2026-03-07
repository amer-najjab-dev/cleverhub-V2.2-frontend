import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  date, 
  onChange,
  placeholder = "Sélectionner une date"
}) => {
  const formatDate = (date?: Date | null): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      onChange(null);
      return;
    }
    const newDate = new Date(value + 'T12:00:00');
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  };

  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 
w-4 h-4 text-gray-400" />
      <input
        type="date"
        value={formatDate(date)}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
};
