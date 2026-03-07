import { api } from '../../../services/api';

export interface ProductPrediction {
  productId: number;
  productName: string;
  category: string;
  laboratory?: string;
  currentStock: number;
  predictedDemandNext30Days: number;
  predictedDemandNext90Days: number;
  seasonalFactor: number;
  realSalesLast30Days: number;
  recommendedOrder: number;
  safetyStock: number;
  reorderPoint: number;
  isEmergingTrend: boolean;
  confidence: number;
  predictionSource: 'market' | 'hybrid' | 'real';
}

export interface EmergingTrend {
  laboratory: string;
  productIds: number[];
  productNames: string[];
  salesCount: number;
  period: 'week' | 'month';
  confidence: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface MarketIntelligence {
  seasonalHighRisk: string[];
  emergingTrends: EmergingTrend[];
  totalPredictedDemand: number;
  totalRecommendedInvestment: number;
}

export const productIntelligenceService = {
  // Obtener predicciones para productos top
  getPredictions: async (limit: number = 20): Promise<ProductPrediction[]> => {
    const response = await api.get(`/ai/products/predictions?limit=${limit}`);
    return response.data.data;
  },

  // Obtener inteligencia de mercado
  getMarketIntelligence: async (): Promise<MarketIntelligence> => {
    const response = await api.get('/ai/products/market-intelligence');
    return response.data.data;
  },

  // Obtener tendencias emergentes
  getEmergingTrends: async (period: 'week' | 'month' = 'week'): Promise<EmergingTrend[]> => {
    const response = await api.get(`/ai/products/trends?period=${period}`);
    return response.data.data;
  },

  // Obtener categorías de alto riesgo estacional
  getHighRiskCategories: async (): Promise<string[]> => {
    const response = await api.get('/ai/products/high-risk-categories');
    return response.data.data;
  }
};