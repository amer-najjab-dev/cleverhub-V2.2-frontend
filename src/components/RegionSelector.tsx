import React, { useState } from 'react';
import { useRegion } from '../contexts/RegionContext';
import { Globe, ChevronDown } from 'lucide-react';

const regionFlags: Record<string, string> = {
  MA: '🇲🇦',
  FR: '🇫🇷',
  ES: '🇪🇸',
  TN: '🇹🇳',
  DZ: '🇩🇿'
};

export const RegionSelector: React.FC = () => {
  const { currentRegion, setRegion, availableRegions } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (regionCode: string) => {
    setRegion(regionCode as any);
    setIsOpen(false);
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
      >
        <Globe className="w-4 h-4" />
        <span>{regionFlags[currentRegion.code] || '🌍'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => handleSelect(region.code)}
              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-sm ${
                currentRegion.code === region.code ? 'bg-blue-50' : ''
              }`}
            >
              <span>{regionFlags[region.code] || '🌍'}</span>
              <span className="text-gray-600">{region.currency.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
