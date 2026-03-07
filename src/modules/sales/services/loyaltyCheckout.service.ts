import { api } from '../../../services/api';

export interface RedeemableReward {
  id: number;
  type: 'reward' | 'pack';
  name: string;
  pointsCost: number;
  productId?: number;
  product?: {
    id: number;
    name: string;
    pricePPV: number;
    stock: number;
  };
  products?: Array<{
    id: number;
    name: string;
    pricePPV: number;
    stock: number;
  }>;
  originalValue: number;
}

export interface AvailableRewardsResponse {
  data: RedeemableReward[];
  clientPoints: number;
}

export const loyaltyCheckoutService = {
  // Obtener recompensas disponibles para el cliente
  getAvailableRewards: async (clientId: number): Promise<AvailableRewardsResponse> => {
    const response = await api.get(`/loyalty-checkout/available/${clientId}`);
    return response.data;
  },
  
  // Canjear múltiples items
  redeemItems: async (clientId: number, items: any[], saleId?: number) => {
    const response = await api.post(`/loyalty-checkout/redeem/${clientId}`, {
      items,
      saleId
    });
    return response.data.data;
  },
  
  // Canjear una recompensa individual
  redeemReward: async (clientId: number, rewardId: number, saleId?: number) => {
    return loyaltyCheckoutService.redeemItems(clientId, [{
      id: rewardId,
      type: 'reward'
    }], saleId);
  },
  
  // Canjear un pack individual
  redeemPack: async (clientId: number, packId: number, saleId?: number) => {
    return loyaltyCheckoutService.redeemItems(clientId, [{
      id: packId,
      type: 'pack'
    }], saleId);
  }
};