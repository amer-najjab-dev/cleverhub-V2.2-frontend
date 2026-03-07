import { Tag, MapPin } from 'lucide-react';
import { useCurrencyFormatter } from '../../utils/formatters';

interface MainInfoContainerProps {
  name: string;
  pricePPV: number;
  pricePPH: number;
  category?: string;
  zone?: string;
}


export const MainInfoContainer = ({ name, pricePPV, pricePPH, category, zone }: MainInfoContainerProps) => {
  const { formatCurrency } = useCurrencyFormatter();
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          <div className="flex gap-4 mt-2">
            {category && (
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <Tag size={14} />
                {category}
              </span>
            )}
            {zone && (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                <MapPin size={14} />
                {zone}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(pricePPV || 0)}</div>
          <div className="text-sm text-gray-500">PPV</div>
          <div className="mt-1 text-lg font-medium text-gray-700">{formatCurrency(pricePPH || 0)}</div>
          <div className="text-xs text-gray-400">PPH</div>
        </div>
      </div>
    </div>
  );
};