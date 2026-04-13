import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'fr' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={currentLang === 'es' ? 'Cambiar a Francés' : 'Passer à Espagnol'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{currentLang === 'es' ? '🇪🇸 ES' : '🇫🇷 FR'}</span>
    </button>
  );
};
