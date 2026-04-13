import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../contexts/RegionContext';

// Mapeo de región a idioma
const regionToLanguage: Record<string, string> = {
  MA: 'fr',  // Marruecos → Francés
  FR: 'fr',  // Francia → Francés
  ES: 'es',  // España → Español
  TN: 'fr',  // Túnez → Francés
  DZ: 'fr',  // Argelia → Francés
};

export const useSyncLanguageWithRegion = () => {
  const { currentRegion } = useRegion();
  const { i18n } = useTranslation();

  useEffect(() => {
    const targetLanguage = regionToLanguage[currentRegion.code] || 'fr';
    if (i18n.language !== targetLanguage) {
      i18n.changeLanguage(targetLanguage);
      localStorage.setItem('i18nextLng', targetLanguage);
    }
  }, [currentRegion.code, i18n]);
};
