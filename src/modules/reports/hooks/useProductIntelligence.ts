import { useState, useEffect } from 'react';
import { productIntelligenceService } from '../services/productIntelligence.service';
import type { 
  ProductPrediction,
  MarketIntelligence,
  EmergingTrend 
} from '../services/productIntelligence.service';

export const useProductIntelligence = () => {
  const [predictions, setPredictions] = useState<ProductPrediction[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);
  const [emergingTrends, setEmergingTrends] = useState<EmergingTrend[]>([]);
  const [highRiskCategories, setHighRiskCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para asignar categorías a los productos (lógica de negocio)
  const assignCategory = (prediction: ProductPrediction) => {
    // Lógica para asignar categorías basada en el nombre del producto o laboratorio
    const name = prediction.productName.toLowerCase();
    
    if (name.includes('antibiotique') || name.includes('amoxicilline')) {
      return 'Antibiotiques';
    } else if (name.includes('anti-inflammatoire') || name.includes('ibuprofène')) {
      return 'Anti-inflammatoires';
    } else if (name.includes('antihypertenseur') || name.includes('amlodipine')) {
      return 'Cardiovasculaire';
    } else if (name.includes('antidiabétique') || name.includes('metformine')) {
      return 'Diabète';
    } else if (name.includes('dermocosmétique') || name.includes('crème')) {
      return 'Dermocosmétique';
    } else if (name.includes('vitamine') || name.includes('complément')) {
      return 'Compléments alimentaires';
    } else {
      return prediction.category || 'Autres';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener predicciones
        const predictionsData = await productIntelligenceService.getPredictions(50);
        
        // Obtener inteligencia de mercado
        const marketData = await productIntelligenceService.getMarketIntelligence();
        
        // Obtener tendencias emergentes
        const trendsData = await productIntelligenceService.getEmergingTrends();

        // Enriquecer predicciones con categorías asignadas
        const enhancedPredictions = predictionsData.map(pred => ({
          ...pred,
          assignedCategory: assignCategory(pred)
        }));

        console.log('📦 Predicciones cargadas:', enhancedPredictions.length);
        console.log('📊 Inteligencia de mercado:', marketData);
        console.log('📈 Tendencias emergentes:', trendsData.length);

        setPredictions(enhancedPredictions);
        setMarketIntelligence(marketData);
        setEmergingTrends(trendsData);
        setHighRiskCategories(marketData?.seasonalHighRisk || []);
        
      } catch (err: any) {
        setError(err.message);
        console.error('❌ Error loading product intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para filtrar productos por categoría
  const filterByCategory = (category: string) => {
    if (!category || category === 'all') return predictions;
    return predictions.filter(p => p.category === category);
  };

  // Función para obtener productos con stock bajo
  const getLowStockProducts = (threshold: number = 10) => {
    return predictions.filter(p => p.currentStock < threshold);
  };

  // Función para obtener productos con alta demanda
  const getHighDemandProducts = (minDemand: number = 50) => {
    return predictions.filter(p => p.predictedDemandNext30Days > minDemand);
  };

  // Función para recomendar órdenes de compra
  const getRecommendedOrders = () => {
    return predictions
      .filter(p => p.recommendedOrder > 0)
      .sort((a, b) => b.recommendedOrder - a.recommendedOrder);
  };

  // Función para calcular el valor total de inventario
  const getTotalInventoryValue = () => {
    return predictions.reduce((sum, p) => sum + (p.currentStock * (p.marketBaseline?.expectedMonthlySales || 0)), 0);
  };

  // Función para refrescar datos
  const refetch = async () => {
    setLoading(true);
    try {
      const predictionsData = await productIntelligenceService.getPredictions(50);
      const marketData = await productIntelligenceService.getMarketIntelligence();
      const trendsData = await productIntelligenceService.getEmergingTrends();

      const enhancedPredictions = predictionsData.map(pred => ({
        ...pred,
        assignedCategory: assignCategory(pred)
      }));

      setPredictions(enhancedPredictions);
      setMarketIntelligence(marketData);
      setEmergingTrends(trendsData);
      setHighRiskCategories(marketData?.seasonalHighRisk || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Datos principales
    predictions,
    marketIntelligence,
    emergingTrends,
    highRiskCategories,
    
    // Estados
    loading,
    error,
    
    // Funciones de utilidad
    filterByCategory,
    getLowStockProducts,
    getHighDemandProducts,
    getRecommendedOrders,
    getTotalInventoryValue,
    refetch
  };
};