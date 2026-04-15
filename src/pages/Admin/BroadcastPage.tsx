import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService, BroadcastPayload } from '../../services/admin.service';

export const BroadcastPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BroadcastPayload>({
    target: 'ALL',
    title: '',
    message: '',
    action_url: '',
    filters: { sendEmail: false }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.sendBroadcast(form);
      alert(t('adminBroadcast.success'));
      setForm({
        target: 'ALL',
        title: '',
        message: '',
        action_url: '',
        filters: { sendEmail: false }
      });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert(t('adminBroadcast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('adminBroadcast.title')}</h1>
          <p className="text-gray-600 mt-1">{t('adminBroadcast.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminBroadcast.target')}
              </label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">{t('adminBroadcast.target_all')}</option>
                <option value="ACTIVE">{t('adminBroadcast.target_active')}</option>
                <option value="GRACE_PERIOD">{t('adminBroadcast.target_grace')}</option>
                <option value="SUSPENDED">{t('adminBroadcast.target_suspended')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminBroadcast.title_label')}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('adminBroadcast.title_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminBroadcast.message_label')}
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('adminBroadcast.message_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminBroadcast.action_url_label')}
              </label>
              <input
                type="text"
                value={form.action_url}
                onChange={(e) => setForm({ ...form, action_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('adminBroadcast.action_url_placeholder')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={form.filters?.sendEmail}
                onChange={(e) => setForm({ ...form, filters: { ...form.filters, sendEmail: e.target.checked } })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700">
                {t('adminBroadcast.send_email')}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t('common.loading') : t('adminBroadcast.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};