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

const regionNames: Record<string, string> = {
  MA: 'Marruecos',
  FR: 'Francia',
  ES: 'España',
  TN: 'Túnez',
  DZ: 'Argelia'
};

export const RegionSelector: React.FC = () => {
  const { currentRegion, setRegion, availableRegions } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (regionCode: string) => {
    setRegion(regionCode as any);
    setIsOpen(false);
    // Recargar para aplicar cambios en todos los componentes
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentRegion.currency.code} ({currentRegion.currency.symbol})
        </span>
        <span className="text-sm">{regionFlags[currentRegion.code] || '🌍'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => handleSelect(region.code)}
              className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors ${
                currentRegion.code === region.code ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{region.currency.code}</span>
                <span className="text-sm text-gray-500">({region.currency.symbol})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{regionNames[region.code] || region.code}</span>
                <span>{regionFlags[region.code] || '🌍'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
