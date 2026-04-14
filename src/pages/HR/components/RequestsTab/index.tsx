import { useTranslation } from 'react-i18next';

export const RequestsTab = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{t('hr.requests.title')}</h3>
      <p className="text-gray-500">{t('hr.requests.coming_soon')}</p>
    </div>
  );
};
