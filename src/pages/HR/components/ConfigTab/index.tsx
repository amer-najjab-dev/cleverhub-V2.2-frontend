import { useTranslation } from 'react-i18next';

export const ConfigTab = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{t('hr.config.title')}</h3>
      <p className="text-gray-500">{t('hr.config.coming_soon')}</p>
    </div>
  );
};
