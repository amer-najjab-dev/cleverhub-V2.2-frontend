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
  lastPurchaseDate: Date;
  daysSinceLastPurchase: number;
  riskLevel: 'low' | 'medium' | 'high';
  nextExpectedPurchaseDate: Date;
}

export interface DormantClient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastPurchaseDate: Date | null;
  daysSinceLastPurchase: number;
}

export interface TierAnalysis {
  tiers: {
    Bronze: { count: number; totalSpent: number; clients: any[] };
    Argent: { count: number; totalSpent: number; clients: any[] };
    Or: { count: number; totalSpent: number; clients: any[] };
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
  // Obtener resumen completo de fidelización
  getSummary: async (): Promise<LoyaltySummary> => {
    const response = await api.get('/ai/loyalty/summary');
    return response.data.data;
  },

  // Obtener puntos en circulación
  getPointsInCirculation: async (): Promise<LoyaltyPoints> => {
    const response = await api.get('/ai/loyalty/points/circulation');
    return response.data.data;
  },

  // Obtener puntos de un cliente específico
  getClientPoints: async (clientId: number): Promise<any> => {
    const response = await api.get(`/ai/loyalty/points/client/${clientId}`);
    return response.data.data;
  },

  // Obtener pacientes crónicos
  getChronicPatients: async (): Promise<ChronicPatient[]> => {
    const response = await api.get('/ai/loyalty/chronic-patients');
    return response.data.data;
  },

  // Obtener clientes dormidos
  getDormantClients: async (days: number = 90): Promise<DormantClient[]> => {
    const response = await api.get(`/ai/loyalty/dormant-clients?days=${days}`);
    return response.data.data;
  },

  // Obtener análisis por tiers
  getTierAnalysis: async (): Promise<TierAnalysis> => {
    const response = await api.get('/ai/loyalty/tiers');
    return response.data.data;
  },

  // Obtener categorías favoritas por tier
  getFavoriteCategories: async (tier: 'Or'): Promise<FavoriteCategory[]> => {
    const response = await api.get(`/ai/loyalty/categories/${tier}`);
    return response.data.data;
  }
};