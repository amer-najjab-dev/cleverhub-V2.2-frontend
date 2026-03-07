import { Calendar, Clock, TrendingUp, Package, History } from 'lucide-react';
import { PriceHistory, InventoryLot, StockMovement } from '../../services/products.service';
import { useCurrencyFormatter } from '../../utils/formatters';

interface InventoryHistoryTableProps {
  priceHistory?: PriceHistory[];
  inventoryLots?: InventoryLot[];
  stockMovements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export const InventoryHistoryTable = ({
  priceHistory,
  inventoryLots,
  stockMovements,
  createdAt,
  updatedAt,
}: InventoryHistoryTableProps) => {
  const { formatCurrency } = useCurrencyFormatter();
  return (
    <div className="space-y-6">
      {/* Prix & Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          Prix & Dates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Créé le:</span>
            <span className="font-medium text-gray-800">{new Date(createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Mis à jour le:</span>
            <span className="font-medium text-gray-800">{new Date(updatedAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        {priceHistory && priceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">PPV ({formatCurrency(0).split(' ')[1] || 'MAD'})</th>
                  <th className="px-4 py-2 text-left">PPH ({formatCurrency(0).split(' ')[1] || 'MAD'})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {priceHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2 font-medium">{item.pricePPV.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-600">{item.pricePPH.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 italic">Aucun historique de prix</div>
        )}
      </div>

      {/* Péremption & Traçabilité */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          Péremption & Traçabilité
        </h2>
        {inventoryLots && inventoryLots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Lot</th>
                  <th className="px-4 py-2 text-left">Expiration</th>
                  <th className="px-4 py-2 text-left">Quantité</th>
                  <th className="px-4 py-2 text-left">Créé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryLots.map((lot) => (
                  <tr key={lot.id}>
                    <td className="px-4 py-2 font-mono text-xs">{lot.batchNumber}</td>
                    <td className="px-4 py-2">{new Date(lot.expiryDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2">{lot.quantity}</td>
                    <td className="px-4 py-2">{new Date(lot.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 italic">Aucun lot enregistré</div>
        )}
      </div>

      {/* Historique & Avoirs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          Historique & Avoirs
        </h2>
        {stockMovements && stockMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Qté</th>
                  <th className="px-4 py-2 text-left">Stock après</th>
                  <th className="px-4 py-2 text-left">Lot</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td className="px-4 py-2">{new Date(mov.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        mov.type === 'vente' ? 'bg-green-100 text-green-700' :
                        mov.type === 'achat' ? 'bg-blue-100 text-blue-700' :
                        mov.type === 'retour' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{mov.quantity}</td>
                    <td className="px-4 py-2 font-medium">{mov.stockAfter}</td>
                    <td className="px-4 py-2">{mov.lot?.batchNumber || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{mov.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 italic">Aucune transaction</div>
        )}
      </div>
    </div>
  );
};