import { api } from '../../../services/api';

export interface ClientRiskScore {
  clientId: number;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  paymentScore: number;
  delayScore: number;
  frequencyScore: number;
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  clientCount: number;
  averageSpent: number;
  color: string;
}

export interface PurchaseBehavior {
  clientId: number;
  clientName: string;
  favoriteCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  favoriteLaboratories: Array<{
    laboratory: string;
    count: number;
    percentage: number;
  }>;
  purchaseFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rare';
  averageDaysBetweenPurchases: number;
  lastPurchaseDate: string;
  firstPurchaseDate: string;
  preferredPaymentMethod: string;
  preferredHour: number;
}

export interface ClientIntelligence {
  totalClients: number;
  totalRevenue: number;
  averagePerClient: number;
  atRiskCount: number;
  atRiskPercentage: number;
  segments: ClientSegment[];
}

export const clientIntelligenceService = {
  getClientIntelligence: async (): Promise<ClientIntelligence> => {
    const response = await api.get('/ai/clients/intelligence');
    return response.data.data;
  },

  getAllRiskScores: async (): Promise<ClientRiskScore[]> => {
    const response = await api.get('/ai/clients/risk-scores');
    return response.data.data;
  },

  getClientRiskScore: async (clientId: number): Promise<ClientRiskScore> => {
    const response = await api.get(`/ai/clients/${clientId}/risk-score`);
    return response.data.data;
  },

  getClientSegments: async (): Promise<ClientSegment[]> => {
    const response = await api.get('/ai/clients/segments');
    return response.data.data;
  },

  getClientPurchaseBehavior: async (clientId: number): Promise<PurchaseBehavior> => {
    const response = await api.get(`/ai/clients/${clientId}/behavior`);
    return response.data.data;
  },
};