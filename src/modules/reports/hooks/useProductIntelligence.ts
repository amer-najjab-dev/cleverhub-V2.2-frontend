import { useState, useEffect } from 'react';
import { 
  productIntelligenceService, 
  ProductPrediction, 
  MarketIntelligence, 
  EmergingTrend 
} from '../services/productIntelligence.service';

// Función para asignar categoría basada en el nombre del producto
const assignCategory = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('vitamine') || name.includes('vitamin')) {
    return 'Vitamines';
  }
  if (name.includes('doliprane') || name.includes('paracétamol')) {
    return 'Antalgiques';
  }
  if (name.includes('antibiotique') || name.includes('pénicilline') || 
      name.includes('aciclovir') || name.includes('amoxicilline')) {
    return 'Antibiotiques';
  }
  if (name.includes('anti-inflammatoire') || name.includes('douleur') ||
      name.includes('acide') || name.includes('diclofénac')) {
    return 'Anti-inflammatoires';
  }
  if (name.includes('antihypertenseur') || name.includes('cardiaque') ||
      name.includes('zoledronique')) {
    return 'Cardiovasculaires';
  }
  if (name.includes('dermocosmétique') || name.includes('crème') ||
      name.includes('solaire') || name.includes('brulaxy')) {
    return 'Dermocosmétique';
  }
  if (name.includes('antihistaminique') || name.includes('allergie')) {
    return 'Allergologie';
  }
  if (name.includes('digest') || name.includes('antiulcéreux')) {
    return 'Gastro-entérologie';
  }
  if (name.includes('abiraterone') || name.includes('abiranat')) {
    return 'Oncologie';
  }
  
  return 'Autres';
};

export const useProductIntelligence = () => {
  const [predictions, setPredictions] = useState<ProductPrediction[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);
  const [emergingTrends, setEmergingTrends] = useState<EmergingTrend[]>([]);
  const [highRiskCategories, setHighRiskCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Fetching product intelligence data...');

      const [predictionsData, marketData, trendsData, categoriesData] = await Promise.all([
        productIntelligenceService.getPredictions(50),
        productIntelligenceService.getMarketIntelligence(),
        productIntelligenceService.getEmergingTrends('week'),
        productIntelligenceService.getHighRiskCategories()
      ]);

      console.log('📦 Predicciones recibidas (original):', predictionsData);

      // Asignar categorías a los productos que no tienen
      const enhancedPredictions = predictionsData.map(p => ({
        ...p,
        category: p.category || assignCategory(p.productName)
      }));

      console.log('📦 Predicciones con categorías asignadas:', enhancedPredictions.map(p => ({
        name: p.productName.substring(0, 30),
        category: p.category
      })));

      // Exponer globalmente para debug
      (window as any).__predictions = enhancedPredictions;
      console.log('✅ Datos expuestos en window.__predictions');

      setPredictions(enhancedPredictions);
      setMarketIntelligence(marketData);
      setEmergingTrends(trendsData);
      setHighRiskCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de inteligencia de productos');
      console.error('🔴 Error loading product intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    predictions,
    marketIntelligence,
    emergingTrends,
    highRiskCategories,
    loading,
    error,
    refetch: fetchData
  };
};