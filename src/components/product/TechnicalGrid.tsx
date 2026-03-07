import { Barcode, FlaskRound as Flask, Building2, Pill } from 'lucide-react';

interface TechnicalGridProps {
  barcode?: string;
  dosageForm?: string;
  laboratory?: string;
  prescription?: boolean;
  sku?: string;
}

export const TechnicalGrid = ({ barcode, dosageForm, laboratory, prescription, sku }: TechnicalGridProps) => {
  const items = [
    { icon: Barcode, label: 'Code Barre', value: barcode },
    { icon: Flask, label: 'Forme galénique', value: dosageForm },
    { icon: Building2, label: 'Laboratoire', value: laboratory },
    { icon: Pill, label: 'Prescription', value: prescription !== undefined ? (prescription ? 'Oui' : 'Non') : undefined },
    { icon: null, label: 'SKU', value: sku },
  ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations techniques</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {item.icon && <item.icon className="w-5 h-5 text-gray-400 mt-0.5" />}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
              <div className="text-base font-medium text-gray-900">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};