import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService, HealthStatus } from '../../services/admin.service';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export const HealthPage = () => {
  const { t } = useTranslation();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'green' | 'yellow' | 'red'>('green');

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await adminService.getHealthStatus();
      setHealth(data);
    } catch (error) {
      console.error('Error loading health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'EXPIRING_SOON':
      case 'NO_RECENT_SALES':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentData = health?.status[selectedStatus] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('adminHealth.title')}</h1>
            <p className="text-gray-600 mt-1">{t('adminHealth.subtitle')}</p>
          </div>
          <button
            onClick={loadHealth}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh')}
          </button>
        </div>

        {/* Resumen de estados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => setSelectedStatus('green')}
            className={`cursor-pointer bg-white rounded-xl shadow-sm border p-6 transition-all ${
              selectedStatus === 'green' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('adminHealth.green_status')}</p>
                <p className="text-3xl font-bold text-green-600">{health?.summary.green || 0}</p>
                <p className="text-xs text-gray-400 mt-1">{t('adminHealth.green_desc')}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-100" />
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus('yellow')}
            className={`cursor-pointer bg-white rounded-xl shadow-sm border p-6 transition-all ${
              selectedStatus === 'yellow' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('adminHealth.yellow_status')}</p>
                <p className="text-3xl font-bold text-yellow-600">{health?.summary.yellow || 0}</p>
                <p className="text-xs text-gray-400 mt-1">{t('adminHealth.yellow_desc')}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-100" />
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus('red')}
            className={`cursor-pointer bg-white rounded-xl shadow-sm border p-6 transition-all ${
              selectedStatus === 'red' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('adminHealth.red_status')}</p>
                <p className="text-3xl font-bold text-red-600">{health?.summary.red || 0}</p>
                <p className="text-xs text-gray-400 mt-1">{t('adminHealth.red_desc')}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-100" />
            </div>
          </div>
        </div>

        {/* Lista detallada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {selectedStatus === 'green' && `🟢 ${t('adminHealth.green_pharmacies')}`}
              {selectedStatus === 'yellow' && `🟡 ${t('adminHealth.yellow_pharmacies')}`}
              {selectedStatus === 'red' && `🔴 ${t('adminHealth.red_pharmacies')}`}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {currentData.length === 0 ? (
              <p className="p-6 text-center text-gray-500">{t('adminHealth.no_pharmacies')}</p>
            ) : (
              currentData.map((pharmacy: any) => (
                <div key={pharmacy.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(pharmacy.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{pharmacy.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t('adminHealth.license')}: {pharmacy.license}</p>
                        {pharmacy.subscription_end && (
                          <p className="text-sm text-gray-500">
                            {t('adminHealth.expires')}: {new Date(pharmacy.subscription_end).toLocaleDateString()}
                          </p>
                        )}
                        {pharmacy.total_sales !== undefined && (
                          <p className="text-sm text-gray-500">
                            {t('adminHealth.total_sales')}: {pharmacy.total_sales}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">{t('adminHealth.view_details')}</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};