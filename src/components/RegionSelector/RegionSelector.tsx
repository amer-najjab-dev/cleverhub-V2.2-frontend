import React, { useState } from 'react';
import { useRegion } from '../../contexts/RegionContext';
import { ChevronDown } from 'lucide-react';

const flagEmoji: Record<string, string> = {
  MA: '🇲🇦',
  FR: '🇫🇷',
  ES: '🇪🇸',
  TN: '🇹🇳',
  DZ: '🇩🇿',
  NA: '🇲🇦'
};

export const RegionSelector: React.FC = () => {
  const { currentRegion, setRegion, availableRegions } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 group"
      >
        <span className="mr-2 text-lg">{flagEmoji[currentRegion.code]}</span>
        <span className="mr-1.5">{currentRegion.currency.symbol}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => {
                setRegion(region.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                region.code === currentRegion.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="mr-2.5 text-lg">{flagEmoji[region.code]}</span>
              <span className="flex-1 text-left">{region.name}</span>
              <span className="text-xs text-gray-500">{region.currency.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};