import { api } from './api';

export interface DeliveryNoteItem {
  product_id: number;
  quantity: number;
  unit_cost_pph: number;
  suggested_ppv?: number;
  expiration_date: string;
  batch_number?: string;
}

export interface DeliveryNote {
  note_number: string;
  supplier_id: string;
  bl_number?: string;
  reception_date: string;
  items: DeliveryNoteItem[];
  notes?: string;
  payment_terms?: string;
  due_date?: string;
}

export const deliveryService = {
  async registerDelivery(data: DeliveryNote) {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  async registerPayment(obligation_id: number, amount: number, payment_method: string, reference?: string) {
    const response = await api.post('/obligations/payments', {
      obligation_id,
      amount,
      payment_method,
      reference
    });
    return response.data;
  },

  async getSupplierObligations(supplierId: string) {
    const response = await api.get(`/suppliers/${supplierId}/obligations`);
    return response.data;
  }
};
