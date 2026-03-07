import React from 'react';
import { PurchaseBehavior } from '../../services/clientIntelligence.service';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Package, 
  Building2,
  TrendingUp
} from 'lucide-react';

interface ClientBehaviorProps {
  behavior: PurchaseBehavior;
}

export const ClientBehavior: React.FC<ClientBehaviorProps> = ({ behavior }) => {
  // Eliminado formatCurrency que no se usaba

  const frequencyMap = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    rare: 'Rare'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Comportement d'achat - {behavior.clientName}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información general */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Premier achat</p>
              <p className="font-medium">{new Date(behavior.firstPurchaseDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Dernier achat</p>
              <p className="font-medium">{new Date(behavior.lastPurchaseDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Fréquence</p>
              <p className="font-medium">{frequencyMap[behavior.purchaseFrequency]}</p>
              <p className="text-xs text-gray-500">Ø {behavior.averageDaysBetweenPurchases} jours entre achats</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Paiement préféré</p>
              <p className="font-medium capitalize">{behavior.preferredPaymentMethod}</p>
              <p className="text-xs text-gray-500">Heure préférée: {behavior.preferredHour}h</p>
            </div>
          </div>
        </div>

        {/* Catégories favorites */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Catégories favorites
          </h4>
          {behavior.favoriteCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{cat.category}</span>
                <span className="font-medium">{cat.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Laboratoires favoris */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Laboratoires favoris
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {behavior.favoriteLaboratories.map((lab, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{lab.laboratory}</span>
                  <span className="font-medium">{lab.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${lab.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};