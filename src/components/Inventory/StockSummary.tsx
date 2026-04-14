import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import { useCurrencyFormatter } from '../../utils/formatters';

interface StockSummaryProps {
  totalPPH: number;
  totalPPV: number;
  margin: number;
  lowStockCount: number;
  expiringCount: number;
}

export const StockSummary = ({
  totalPPH,
  totalPPV,
  margin,
  lowStockCount,
  expiringCount
}: StockSummaryProps) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('stockSummary.pph_value')}</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPPH)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('stockSummary.ppv_value')}</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPPV)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Percent className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('stockSummary.gross_margin')}</div>
            <div className="text-xl font-bold text-purple-600">{formatCurrency(margin)}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lowStockCount > 0 && (
            <div className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              {t('stockSummary.low_stock_products', { count: lowStockCount })}
            </div>
          )}
          {expiringCount > 0 && (
            <div className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
              {t('stockSummary.expiring_soon', { count: expiringCount })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
