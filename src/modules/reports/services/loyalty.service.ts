import { api } from '../../../services/api';

export interface LoyaltyPoints {
  totalPoints: number;
  totalPointsAvailable: number;
  totalPointsUsed: number;
  clientsWithPoints: number;
}

export interface ChronicPatient {
  clientId: number;
  clientName: string;
  clientPhone: string;
  medication: string;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
  riskLevel: 'low' | 'medium' | 'high';
  nextExpectedPurchaseDate: string;
}

export interface DormantClient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastPurchaseDate: string | null;
  daysSinceLastPurchase: number;
}

export interface TierData {
  count: number;
  totalSpent: number;
  clients: any[];
}

export interface TierAnalysis {
  tiers: {
    Bronze: TierData;
    Argent: TierData;
    Or: TierData;
  };
  totalClients: number;
  averageSpentByTier: {
    Bronze: number;
    Argent: number;
    Or: number;
  };
}

export interface FavoriteCategory {
  category: string;
  count: number;
}

export interface LoyaltySummary {
  points: LoyaltyPoints;
  chronic: {
    total: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    patients: ChronicPatient[];
  };
  dormant: {
    total: number;
    clients: DormantClient[];
  };
  tiers: TierAnalysis;
  favoriteCategories: FavoriteCategory[];
}

export const loyaltyService = {
  getLoyaltySummary: async (): Promise<LoyaltySummary> => {
    const response = await api.get('/ai/loyalty/summary');
    return response.data.data;
  },

  getClientLoyalty: async (clientId: number) => {
    const response = await api.get(`/ai/loyalty/client/${clientId}`);
    return response.data.data;
  },

  getPointsInCirculation: async (): Promise<LoyaltyPoints> => {
    const response = await api.get('/ai/loyalty/points-in-circulation');
    return response.data.data;
  },

  getChronicPatients: async (): Promise<ChronicPatient[]> => {
    const response = await api.get('/ai/loyalty/chronic-patients');
    return response.data.data;
  },

  getDormantClients: async (days?: number): Promise<DormantClient[]> => {
    const response = await api.get('/ai/loyalty/dormant-clients', { params: { days } });
    return response.data.data;
  },

  getTierAnalysis: async (): Promise<TierAnalysis> => {
    const response = await api.get('/ai/loyalty/tier-analysis');
    return response.data.data;
  },

  getFavoriteCategoriesByTier: async (tier: string): Promise<FavoriteCategory[]> => {
    const response = await api.get(`/ai/loyalty/favorite-categories/${tier}`);
    return response.data.data;
  },
};