import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  X, 
  Check, 
  TrendingUp, 
  Calendar,
  Users,
  Gift,
} from 'lucide-react';
import { api } from '../../../../services/api';

interface Suggestion {
  type: 'expiring' | 'lowRotation';
  productId: number;
  productName: string;
  laboratory: string;
  stock: number;
  daysToExpiry?: number;
  suggestedPoints: number;
  targetTier: string;
  message: string;
}

interface WeeklyStrategy {
  weekOf: string;
  nearOrCount: number;
  nearOrClients: Array<{
    clientId: number;
    clientName: string;
    phone: string;
    currentPoints: number;
    pointsToOr: number;
    suggestedBonus: number;
  }>;
  strategy: string;
  campaigns: Array<{
    clientId: number;
    message: string;
  }>;
}

export const IAStrategist: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [weeklyStrategy, setWeeklyStrategy] = useState<WeeklyStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<number[]>([]);
  const [showCampaignPreview, setShowCampaignPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suggestionsRes, strategyRes] = await Promise.all([
        api.get('/loyalty/suggestions'),
        api.get('/loyalty/weekly-strategy')
      ]);
      setSuggestions(suggestionsRes.data.data);
      setWeeklyStrategy(strategyRes.data.data);
    } catch (error) {
      console.error('Error loading IA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    // Aquí iría la lógica para crear la promoción automáticamente
    setAcceptedSuggestions([...acceptedSuggestions, suggestion.productId]);
    
    // Simular creación de promoción
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s.productId !== suggestion.productId));
    }, 500);
  };

  const handleCreateCampaign = () => {
    setShowCampaignPreview(true);
  };

  const handleSendCampaign = async () => {
    // Aquí iría la lógica para enviar los mensajes
    alert(`Campagne envoyée à ${weeklyStrategy?.nearOrCount} clients`);
    setShowCampaignPreview(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Clever Strategist IA</h2>
            <p className="text-purple-100 text-sm">
              Intelligence artificielle au service de votre fidélisation
            </p>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-100 mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-sm">Suggestions actives</span>
            </div>
            <span className="text-2xl font-bold">{suggestions.length}</span>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-100 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Clients ciblés</span>
            </div>
            <span className="text-2xl font-bold">{weeklyStrategy?.nearOrCount || 0}</span>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-100 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Stratégie de la semaine</span>
            </div>
            <span className="text-sm">Active</span>
          </div>
        </div>
      </div>

      {/* Estrategia semanal */}
      {weeklyStrategy && weeklyStrategy.nearOrCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Stratégie recommandée cette semaine</h3>
          </div>
          
          <p className="text-gray-700 mb-4">{weeklyStrategy.strategy}</p>
          
          <div className="flex gap-3">
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer la campagne WhatsApp
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Voir les {weeklyStrategy.nearOrCount} clients
            </button>
          </div>

          {/* Preview de campaña */}
          {showCampaignPreview && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="font-medium mb-3">Aperçu des messages</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {weeklyStrategy.campaigns.slice(0, 3).map((campaign, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">{campaign.message}</p>
                  </div>
                ))}
                {weeklyStrategy.campaigns.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    Et {weeklyStrategy.campaigns.length - 3} autres messages...
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCampaignPreview(false)}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendCampaign}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Envoyer la campagne
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions de produits */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Suggestions intelligentes ({suggestions.length})
          </h3>

          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                acceptedSuggestions.includes(suggestion.productId)
                  ? 'opacity-50 border-green-300'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{suggestion.productName}</h4>
                  <p className="text-sm text-gray-500">
                    Laboratoire: {suggestion.laboratory} | Stock: {suggestion.stock}
                    {suggestion.daysToExpiry && ` | Expire dans: ${suggestion.daysToExpiry} jours`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  suggestion.type === 'expiring' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {suggestion.type === 'expiring' ? 'Bientôt expiré' : 'Basse rotation'}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{suggestion.message}</p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Cible:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    suggestion.targetTier === 'Or' ? 'bg-yellow-100 text-yellow-700' :
                    suggestion.targetTier === 'Argent' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {suggestion.targetTier}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    disabled={acceptedSuggestions.includes(suggestion.productId)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Appliquer
                  </button>
                  <button
                    onClick={() => setSuggestions(prev => prev.filter((_, i) => i !== index))}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Ignorer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !weeklyStrategy?.nearOrCount && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune suggestion pour le moment</h3>
          <p className="text-gray-500">
            L'IA analysera vos données en continu et vous proposera des stratégies dès qu'elle détectera des opportunités.
          </p>
        </div>
      )}
    </div>
  );
};