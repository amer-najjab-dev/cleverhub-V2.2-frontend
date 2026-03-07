import React, { createContext, useState, useContext, useEffect } from 'react';
import { RegionCode, RegionConfig, regions } from '../config/regions';

interface RegionContextType {
  currentRegion: RegionConfig;
  setRegion: (code: RegionCode) => void;
  availableRegions: RegionConfig[];
  isLoading: boolean;
}

export const RegionContext = createContext<RegionContextType | undefined>(undefined);

// Clave para localStorage
const STORAGE_KEY = 'cleverhub_region';

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ 
children }) => {
  const [currentRegion, setCurrentRegion] = useState<RegionConfig>(regions.MA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar región guardada o detectar por geolocalización/IP
    const loadRegion = async () => {
      try {
        // Intentar cargar de localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && regions[saved as RegionCode]) {
          setCurrentRegion(regions[saved as RegionCode]);
        } else {
          // Detectar por IP (opcional)
          // const response = await fetch('https://ipapi.co/json/');
          // const data = await response.json();
          // if (data.country_code === 'MA') setCurrentRegion(regions.MA);
          // etc.
        }
      } catch (error) {
        console.error('Error loading region:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegion();
  }, []);

  const setRegion = (code: RegionCode) => {
    if (regions[code]) {
      setCurrentRegion(regions[code]);
      localStorage.setItem(STORAGE_KEY, code);
      // Opcional: recargar la página para aplicar cambios de idioma/moneda
      // window.location.reload();
    }
  };

  const availableRegions = Object.values(regions);

  return (
    <RegionContext.Provider value={{ currentRegion, setRegion, availableRegions, 
isLoading }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextType => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    console.warn('useRegion must be used within a RegionProvider - returning default region');
    // Devolver región por defecto en lugar de lanzar error
    return {
      currentRegion: regions.MA,
      setRegion: () => {},
      availableRegions: Object.values(regions),
      isLoading: false
    };
  }
  return context;
};
