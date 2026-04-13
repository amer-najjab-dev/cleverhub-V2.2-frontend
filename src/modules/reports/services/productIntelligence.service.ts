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
  marketBaseline: any;
  realSalesLast30Days: number;
  recommendedOrder: number;
  safetyStock: number;
  reorderPoint: number;
  isEmergingTrend: boolean;
  trendAlert?: any;
  confidence: number;
  predictionSource: 'market' | 'hybrid' | 'real';
}

export interface MarketIntelligence {
  seasonalHighRisk: string[];
  emergingTrends: EmergingTrend[];
  totalPredictedDemand: number;
  totalRecommendedInvestment: number;
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

export const productIntelligenceService = {
  getPredictions: async (limit?: number): Promise<ProductPrediction[]> => {
    const response = await api.get('/ai/products/predictions', { params: { limit } });
    return response.data.data;
  },

  getMarketIntelligence: async (): Promise<MarketIntelligence> => {
    const response = await api.get('/ai/products/market-intelligence');
    return response.data.data;
  },

  getEmergingTrends: async (): Promise<EmergingTrend[]> => {
    const response = await api.get('/ai/products/trends');
    return response.data.data;
  },
};
