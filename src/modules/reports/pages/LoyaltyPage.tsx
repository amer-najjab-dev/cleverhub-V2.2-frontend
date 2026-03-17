import React, { useState } from 'react';
import { 
  Heart, 
  RefreshCw,
  Gift,
  Package,
  Brain,
  Settings,
  Award
} from 'lucide-react';
import { useLoyalty } from '../hooks/useLoyalty';
import { PointsCard } from '../components/loyalty/PointsCard';
import { TierCards } from '../components/loyalty/TierCards';
import { ChronicPatientsTable } from '../components/loyalty/ChronicPatientsTable';
import { FavoriteCategories } from '../components/loyalty/FavoriteCategories';
import { RewardCatalog } from '../components/loyalty/RewardCatalog';
import { PackCatalog } from '../components/loyalty/PackCatalog';
import { IAStrategist } from '../components/loyalty/IAStrategist';
import { PointsConfig } from '../components/loyalty/PointsConfig';

type LoyaltyTab = 'general' | 'rewards' | 'packs' | 'config' | 'ia';

export const LoyaltyPage: React.FC = () => {
  const { summary, loading, error, refetch } = useLoyalty();
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('general');
  const [chronicActive, setChronicActive] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Error al cargar los datos'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fidélisation</h1>
            <p className="text-gray-500 mt-1">Programme de fidélité et récompenses</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Tabs de navegación principales */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'rewards'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gift className="w-4 h-4" />
              Catalogue Récompenses
            </button>
            <button
              onClick={() => setActiveTab('packs')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'packs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4" />
              Packs Fidélité
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'config'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuration Points
            </button>
            <button
              onClick={() => setActiveTab('ia')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'ia'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Brain className="w-4 h-4" />
              IA Strategist
            </button>
          </nav>
        </div>

        {/* Contenido según tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Points en circulation */}
            <PointsCard points={summary.points} />

            {/* Tiers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" />
                Segmentation par niveau de fidélité
              </h2>
              <TierCards tiers={summary.tiers} />
            </div>

            {/* Grille à deux colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Tabs para pacientes crónicos y dormidos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex gap-4 px-6">
                      <button
                        onClick={() => setChronicActive(true)}
                        className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                          chronicActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Patients chroniques ({summary.chronic.total})
                      </button>
                      <button
                        onClick={() => setChronicActive(false)}
                        className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                          !chronicActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Clients dormants ({summary.dormant.total})
                      </button>
                    </nav>
                  </div>
                  <div className="p-6">
                    {chronicActive ? (
                      <ChronicPatientsTable patients={summary.chronic.patients} />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {/* Aquí iría la tabla de clientes dormidos cuando esté implementada */}
                        <p>Fonctionnalité à venir: Liste des clients dormants</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Catégories favorites des clients Or
                </h3>
                <FavoriteCategories categories={summary.favoriteCategories} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && <RewardCatalog />}
        {activeTab === 'packs' && <PackCatalog />}
        {activeTab === 'config' && <PointsConfig />}
        {activeTab === 'ia' && <IAStrategist />}
      </div>
    </div>
  );
};