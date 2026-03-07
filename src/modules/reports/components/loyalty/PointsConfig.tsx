import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  TrendingUp, 
  Gift, 
  Award,
  Calculator,
  DollarSign,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import { api } from '../../../../services/api';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface LoyaltyConfig {
  id: number;
  pointsPerUnit: number;
  currencyUnit: number;
  minPurchaseForPoints: number;
  pointsExpiryDays: number;
  welcomePoints: number;
  birthdayMultiplier: number;
  firstPurchaseMultiplier: number;
  isActive: boolean;
  tierThresholds: {
    bronze: { min: number; max: number };
    argent: { min: number; max: number };
    or: { min: number; max: number };
  };
}

interface PointsStatistics {
  config: LoyaltyConfig;
  statistics: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    averagePointsPerClient: number;
    pointsInCirculation: number;
  };
}

export const PointsConfig: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [statistics, setStatistics] = useState<PointsStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simAmount, setSimAmount] = useState(100);
  const [simFirstPurchase, setSimFirstPurchase] = useState(false);
  const [simBirthday, setSimBirthday] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'tiers' | 'multipliers'>('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, statsRes] = await Promise.all([
        api.get('/loyalty-config'),
        api.get('/loyalty-config/statistics')
      ]);
      console.log('Config loaded:', configRes.data);
      console.log('Stats loaded:', statsRes.data);
      setConfig(configRes.data.data);
      setStatistics(statsRes.data.data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.put('/loyalty-config', config);
      alert('Configuration sauvegardée avec succès');
      loadData(); // Recargar para obtener datos actualizados
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Réinitialiser la configuration par défaut?')) return;
    try {
      const response = await api.post('/loyalty-config/reset');
      setConfig(response.data.data);
      alert('Configuration réinitialisée');
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  };

  const handleSimulate = async () => {
    try {
      const response = await api.get('/loyalty-config/simulate', {
        params: {
          amount: simAmount,
          isFirstPurchase: simFirstPurchase,
          isBirthday: simBirthday
        }
      });
      setSimResult(response.data.data);
    } catch (error) {
      console.error('Error simulating:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Configuration non disponible</h3>
        <p className="text-gray-500 mb-4">Impossible de charger la configuration des points</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Configuration des Points
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Points en circulation</div>
                <div className="text-xl font-bold text-purple-600">
                  {statistics.statistics.pointsInCirculation.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Points émis</div>
                <div className="text-xl font-bold text-green-600">
                  {statistics.statistics.totalPointsIssued.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gift className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Points utilisés</div>
                <div className="text-xl font-bold text-orange-600">
                  {statistics.statistics.totalPointsRedeemed.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Moyenne par client</div>
                <div className="text-xl font-bold text-blue-600">
                  {statistics.statistics.averagePointsPerClient}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs de configuración */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab('multipliers')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'multipliers'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Multiplicateurs
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tiers'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Niveaux
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 mb-4">Règles générales</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de conversion
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-50 text-gray-600">1 point =</span>
                    <input
                      type="number"
                      value={config.currencyUnit}
                      onChange={(e) => setConfig({ ...config, currencyUnit: parseInt(e.target.value) || 10 })}
                      className="w-20 px-3 py-2 border-0 focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                  <span className="text-gray-600">{formatCurrency(1)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Actuellement: 1 point par {formatCurrency(config.currencyUnit)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achat minimum
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.minPurchaseForPoints}
                      onChange={(e) => setConfig({ ...config, minPurchaseForPoints: parseFloat(e.target.value) || 0 })}
                      className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points de bienvenue
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.welcomePoints}
                    onChange={(e) => setConfig({ ...config, welcomePoints: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <span className="text-gray-600">points</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validité des points
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.pointsExpiryDays}
                      onChange={(e) => setConfig({ ...config, pointsExpiryDays: parseInt(e.target.value) || 365 })}
                      className="w-24 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                  <span className="text-gray-600">jours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'multipliers' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 mb-4">Multiplicateurs spéciaux</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Premier achat
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.firstPurchaseMultiplier}
                    onChange={(e) => setConfig({ ...config, firstPurchaseMultiplier: parseFloat(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    step="0.1"
                  />
                  <span className="text-purple-700">x</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Les nouveaux clients reçoivent {config.firstPurchaseMultiplier}x de points
                </p>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                <label className="block text-sm font-medium text-pink-900 mb-2">
                  Anniversaire
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.birthdayMultiplier}
                    onChange={(e) => setConfig({ ...config, birthdayMultiplier: parseFloat(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    step="0.1"
                  />
                  <span className="text-pink-700">x</span>
                </div>
                <p className="text-xs text-pink-600 mt-1">
                  Les clients reçoivent {config.birthdayMultiplier}x de points le jour de leur anniversaire
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 mb-4">Seuils des niveaux de fidélité</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h5 className="font-medium text-amber-900">Bronze</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-amber-700">Points minimum</span>
                    <div className="text-lg font-bold text-amber-800">0</div>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700">Points maximum</span>
                    <input
                      type="number"
                      value={config.tierThresholds.bronze.max}
                      onChange={(e) => setConfig({
                        ...config,
                        tierThresholds: {
                          ...config.tierThresholds,
                          bronze: { ...config.tierThresholds.bronze, max: parseInt(e.target.value) || 1999 }
                        }
                      })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-gray-600" />
                  <h5 className="font-medium text-gray-900">Argent</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Points minimum</span>
                    <input
                      type="number"
                      value={config.tierThresholds.argent.min}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value) || 2000;
                        setConfig({
                          ...config,
                          tierThresholds: {
                            ...config.tierThresholds,
                            argent: { 
                              min: newMin, 
                              max: config.tierThresholds.argent.max 
                            }
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min={config.tierThresholds.bronze.max + 1}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Points maximum</span>
                    <input
                      type="number"
                      value={config.tierThresholds.argent.max}
                      onChange={(e) => setConfig({
                        ...config,
                        tierThresholds: {
                          ...config.tierThresholds,
                          argent: { 
                            min: config.tierThresholds.argent.min, 
                            max: parseInt(e.target.value) || 4999
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min={config.tierThresholds.argent.min + 1}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h5 className="font-medium text-yellow-900">Or</h5>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-yellow-700">Points minimum</span>
                    <input
                      type="number"
                      value={config.tierThresholds.or.min}
                      onChange={(e) => setConfig({
                        ...config,
                        tierThresholds: {
                          ...config.tierThresholds,
                          or: { 
                            min: parseInt(e.target.value) || 5000, 
                            max: config.tierThresholds.or.max 
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min={config.tierThresholds.argent.max + 1}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-yellow-700">Points maximum</span>
                    <div className="text-lg font-bold text-yellow-800">Illimité</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulador de puntos */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-600" />
            Simulateur de points
          </h4>
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {showSimulator ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        {showSimulator && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant d'achat
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                  <span className="text-gray-600">{formatCurrency(0)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={simFirstPurchase}
                    onChange={(e) => setSimFirstPurchase(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">Premier achat ({config.firstPurchaseMultiplier}x)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={simBirthday}
                    onChange={(e) => setSimBirthday(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">Anniversaire ({config.birthdayMultiplier}x)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Calculer
            </button>

            {simResult && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points de base:</span>
                    <span className="font-medium">{simResult.basePoints}</span>
                  </div>
                  {simResult.multipliers.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{m.name}:</span>
                      <span className="font-medium text-purple-600">x{m.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {simResult.finalPoints} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">Comment ça fonctionne</h5>
            <p className="text-xs text-blue-700">
              Les clients accumulent {config.pointsPerUnit} point pour chaque {formatCurrency(config.currencyUnit)} d'achat.
              Les points sont automatiquement attribués lors de la finalisation de la vente.
              Les clients peuvent échanger leurs points contre des récompenses dans le catalogue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};