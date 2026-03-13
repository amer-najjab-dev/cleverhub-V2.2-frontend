import { api } from './api';
import { AxiosResponse } from 'axios';

export interface Sale {
  // Campos principales
  id: number;
  saleNumber: string;
  clientId?: number;
  userId: number;
  subtotal: number;
  discountAmount?: number;
  discountType?: string;
  discountPercentage?: number;
  taxAmount?: number;
  total: number;
  
  // Campos legacy (mantener para compatibilidad)
  paidAmount: number;
  changeAmount?: number;
  
  // NUEVOS CAMPOS ESPECIFICACIÓN V2.1
  amountReceived?: number;
  amountApplied?: number;
  amountPending?: number;
  
  paymentMethod?: string;
  paymentStatus?: string;
  saleStatus?: string;
  notes?: string;
  
  // Campos booleanos de salud
  adultFlag?: boolean;
  pregnantFlag?: boolean;
  lactatingFlag?: boolean;
  chronicConditionFlag?: boolean;
  usualMedicationFlag?: boolean;
  
  // Fechas
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Relaciones (opcionales, vienen del backend)
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
  items?: Array<any>;
  payments?: Array<any>;
  refunds?: Array<any>;
}

export interface CreateSaleDto {
  userId: number;
  clientId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    discountAmount?: number;
    discountPercentage?: number;
  }>;
  discountType?: 'percentage' | 'fixed' | 'product' | 'cart' | 'none';
  discountAmount?: number;
  discountPercentage?: number;
  paymentMethod: 'cash' | 'Credit Card' | 'credit' | 'Bank Transfer' | 'Bank Cheque' | 'mixed';
  paidAmount: number;
  notes?: string;
  adultFlag?: boolean;
  pregnantFlag?: boolean;
  lactatingFlag?: boolean;
  chronicConditionFlag?: boolean;
  usualMedicationFlag?: boolean;
}

// Interfaz para la respuesta del backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
}

// Helper para extraer data de AxiosResponse
const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  return response.data;
};

// ============================================
// HELPER FUNCTIONS PARA LOS NUEVOS CAMPOS DE PAGO
// ============================================

export class SaleHelper {
  // Obtener monto recibido efectivo (usa nuevos campos o legacy)
  static getEffectiveReceived(sale: Sale): number {
    return sale.amountReceived !== undefined && sale.amountReceived !== null
      ? sale.amountReceived
      : sale.paidAmount;
  }
  
  // Obtener monto aplicado efectivo (usa nuevos campos o calcula según lógica)
  static getEffectiveApplied(sale: Sale): number {
    if (sale.amountApplied !== undefined && sale.amountApplied !== null) {
      return sale.amountApplied;
    }
    
    // Calcular según lógica si no existe
    if (!sale.paymentMethod || !sale.paymentStatus) return 0;
    
    const method = (sale.paymentMethod || '').toLowerCase();
    const status = (sale.paymentStatus || '').toLowerCase();
    const received = this.getEffectiveReceived(sale);
    
    if (['card', 'transfer', 'check'].includes(method)) return sale.total;
    if (method === 'cash' && status === 'paid') return sale.total;
    if (method === 'cash' && status === 'partial') return received;
    if (method === 'credit' && status === 'paid') return sale.total;
    if (method === 'credit' && status === 'partial') return received;
    if (method === 'mixed') return received;
    
    return 0;
  }
  
  // Obtener monto pendiente efectivo (usa nuevos campos o calcula)
  static getEffectivePending(sale: Sale): number {
    if (sale.amountPending !== undefined && sale.amountPending !== null) {
      return sale.amountPending;
    }
    return sale.total - this.getEffectiveApplied(sale);
  }
  
  // Calcular si una venta está completamente pagada
  static isFullyPaid(sale: Sale): boolean {
    const applied = this.getEffectiveApplied(sale);
    return applied >= sale.total;
  }
  
  // Calcular saldo pendiente
  static calculateBalance(sale: Sale): number {
    const applied = this.getEffectiveApplied(sale);
    return Math.max(0, sale.total - applied);
  }
  
  // Obtener estado de pago legible
  static getPaymentStatusDisplay(sale: Sale): string {
    const balance = this.calculateBalance(sale);
    
    if (balance <= 0) return 'Pagado';
    if (this.getEffectiveApplied(sale) > 0) return 'Parcial';
    if (sale.paymentMethod === 'credit') return 'Crédito pendiente';
    return 'Pendiente';
  }
  
  // Calcular porcentaje pagado
  static getPaidPercentage(sale: Sale): number {
    const applied = this.getEffectiveApplied(sale);
    return sale.total > 0 ? (applied / sale.total) * 100 : 0;
  }
  
  // Verificar si es un método de pago diferido
  static isDeferredPayment(sale: Sale): boolean {
    return ['card', 'transfer', 'check'].includes(sale.paymentMethod || '');
  }
  
  // Verificar si es crédito
  static isCredit(sale: Sale): boolean {
    return sale.paymentMethod === 'credit';
  }
  
  // Verificar si es efectivo
  static isCash(sale: Sale): boolean {
    return sale.paymentMethod === 'cash';
  }
  
  // Verificar si es pago mixto
  static isMixed(sale: Sale): boolean {
    return sale.paymentMethod === 'mixed';
  }
  
  // Enriquecer venta con métodos helper
  static enrichSale(sale: Sale): Sale & {
    effectiveReceived: number;
    effectiveApplied: number;
    effectivePending: number;
    isPaid: boolean;
    balance: number;
    statusDisplay: string;
    paidPercentage: number;
  } {
    const effectiveReceived = this.getEffectiveReceived(sale);
    const effectiveApplied = this.getEffectiveApplied(sale);
    const effectivePending = this.getEffectivePending(sale);
    const isPaid = this.isFullyPaid(sale);
    const balance = this.calculateBalance(sale);
    const statusDisplay = this.getPaymentStatusDisplay(sale);
    const paidPercentage = this.getPaidPercentage(sale);
    
    return {
      ...sale,
      effectiveReceived,
      effectiveApplied,
      effectivePending,
      isPaid,
      balance,
      statusDisplay,
      paidPercentage,
    };
  }
}

// Función auxiliar para mapear snake_case a camelCase
const mapSaleFromBackend = (item: any): Sale => ({
  id: item.id,
  saleNumber: item.sale_number,
  clientId: item.client_id,
  userId: item.user_id,
  subtotal: Number(item.subtotal),
  discountAmount: item.discount_amount ? Number(item.discount_amount) : undefined,
  discountType: item.discount_type,
  discountPercentage: item.discount_percentage ? Number(item.discount_percentage) : undefined,
  taxAmount: item.tax_amount ? Number(item.tax_amount) : undefined,
  total: Number(item.total),
  paidAmount: Number(item.paid_amount),
  changeAmount: item.change_amount ? Number(item.change_amount) : undefined,
  amountReceived: item.amount_received ? Number(item.amount_received) : undefined,
  amountApplied: item.amount_applied ? Number(item.amount_applied) : undefined,
  amountPending: item.amount_pending ? Number(item.amount_pending) : undefined,
  paymentMethod: item.payment_method,
  paymentStatus: item.payment_status,
  saleStatus: item.sale_status,
  notes: item.notes,
  adultFlag: item.adult_flag,
  pregnantFlag: item.pregnant_flag,
  lactatingFlag: item.lactating_flag,
  chronicConditionFlag: item.chronic_condition_flag,
  usualMedicationFlag: item.usual_medication_flag,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  client: item.client ? {
    id: item.client.id,
    firstName: item.client.first_name,
    lastName: item.client.last_name,
    email: item.client.email,
    phone: item.client.phone
  } : undefined,
  user: item.user ? {
    id: item.user.id,
    email: item.user.email,
    fullName: item.user.full_name,
    role: item.user.role
  } : undefined,
  items: item.sale_items?.map((si: any) => ({
    id: si.id,
    productId: si.product_id,
    quantity: si.quantity,
    unitPricePPV: Number(si.unit_price_ppv),
    unitPricePPH: Number(si.unit_price_pph),
    discountAmount: si.discount_amount ? Number(si.discount_amount) : undefined,
    discountPercentage: si.discount_percentage ? Number(si.discount_percentage) : undefined,
    subtotal: Number(si.subtotal),
    total: Number(si.total),
    margin: Number(si.margin),
    marginPercentage: Number(si.margin_percentage),
    product: si.product ? {
      id: si.product.id,
      name: si.product.name,
      pricePPV: Number(si.product.pricePPV),
      pricePPH: Number(si.product.pricePPH)
    } : undefined
  }))
});

export const salesService = {
  // Crear nueva venta
  create: (saleData: CreateSaleDto): Promise<ApiResponse<Sale>> => 
    api.post<ApiResponse<Sale>>('/sales', saleData).then(extractData),

  // Obtener todas las ventas (CON MAPEO CORREGIDO)
  getAll: async (params?: any): Promise<ApiResponse<Sale[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/sales', { params });
    
    // Mapear snake_case a camelCase
    const mappedData = response.data.data.map(mapSaleFromBackend);
    
    return {
      ...response.data,
      data: mappedData
    };
  },

  // Obtener venta por ID (CON MAPEO CORREGIDO)
  getById: async (id: number): Promise<ApiResponse<Sale>> => {
    const response = await api.get<ApiResponse<any>>(`/sales/${id}`);
    
    // Mapear snake_case a camelCase
    const mappedData = mapSaleFromBackend(response.data.data);
    
    return {
      ...response.data,
      data: mappedData
    };
  },

  // Obtener venta por número (CON MAPEO CORREGIDO)
  getByNumber: async (saleNumber: string): Promise<ApiResponse<Sale>> => {
    const response = await api.get<ApiResponse<any>>(`/sales/number/${saleNumber}`);
    
    // Mapear snake_case a camelCase
    const mappedData = mapSaleFromBackend(response.data.data);
    
    return {
      ...response.data,
      data: mappedData
    };
  },

  // Aplicar pago FIFO a cliente
  applyPaymentFIFO: (
    clientId: number, 
    paymentAmount: number, 
    paymentData: {
      paymentMethod: string;
      reference?: string;
      notes?: string;
      userId: number;
    }
  ): Promise<ApiResponse<any>> => 
    api.post<ApiResponse<any>>(`/clients/${clientId}/apply-payment-fifo`, {
      paymentAmount,
      ...paymentData
    }).then(extractData),

  // Obtener resumen de crédito del cliente
  getClientCreditSummary: (clientId: number): Promise<ApiResponse<any>> =>
    api.get<ApiResponse<any>>(`/clients/${clientId}/credit-summary`).then(extractData),

  // Obtener ventas por estado de pago
  getSalesByPaymentStatus: async (status: string): Promise<ApiResponse<Sale[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/sales', { params: { paymentStatus: status } });
    
    // Mapear snake_case a camelCase
    const mappedData = response.data.data.map(mapSaleFromBackend);
    
    return {
      ...response.data,
      data: mappedData
    };
  },

  // Reportes
  getDailySales: (date?: Date): Promise<ApiResponse<any>> => {
    const params: any = {};
    if (date) {
      params.date = date.toISOString().split('T')[0];
    }
    return api.get<ApiResponse<any>>('/sales/reports/daily', { params }).then(extractData);
  },

  getBestSellers: (): Promise<ApiResponse<any>> => 
    api.get<ApiResponse<any>>('/sales/reports/best-sellers').then(extractData),

  getSalesSummary: (period?: string): Promise<ApiResponse<any>> => 
    api.get<ApiResponse<any>>('/sales/reports/summary', { params: { period } }).then(extractData),

  // Dashboard
  getDashboardMetrics: (): Promise<ApiResponse<any>> => 
    api.get<ApiResponse<any>>('/sales/dashboard/metrics').then(extractData),

  // Cancelar venta
  cancelSale: (saleId: number, reason: string): Promise<ApiResponse<Sale>> =>
    api.post<ApiResponse<Sale>>(`/sales/${saleId}/cancel`, { reason }).then(extractData),

  // Crear devolución
  createRefund: (saleId: number, refundData: any): Promise<ApiResponse<any>> =>
    api.post<ApiResponse<any>>(`/sales/${saleId}/refunds`, refundData).then(extractData),

  // ============================================
  // HELPERS PARA COMPONENTES FRONTEND
  // ============================================
  
  // Calcular estadísticas de venta (usando los nuevos campos o legacy)
  calculateSaleStats: (sale: Sale) => {
    return {
      effectiveReceived: SaleHelper.getEffectiveReceived(sale),
      effectiveApplied: SaleHelper.getEffectiveApplied(sale),
      effectivePending: SaleHelper.getEffectivePending(sale),
      isPaid: SaleHelper.isFullyPaid(sale),
      balance: SaleHelper.calculateBalance(sale),
      statusDisplay: SaleHelper.getPaymentStatusDisplay(sale),
      paidPercentage: SaleHelper.getPaidPercentage(sale),
      isDeferred: SaleHelper.isDeferredPayment(sale),
      isCredit: SaleHelper.isCredit(sale),
    };
  },
  
  // Formatear venta para mostrar en UI
  formatSaleForDisplay: (sale: Sale) => {
    const stats = SaleHelper.enrichSale(sale);
    
    return {
      ...sale,
      displayInfo: {
        total: sale.total.toFixed(2),
        received: stats.effectiveReceived.toFixed(2),
        applied: stats.effectiveApplied.toFixed(2),
        pending: stats.effectivePending.toFixed(2),
        paidPercentage: stats.paidPercentage.toFixed(1),
        status: stats.statusDisplay,
        isPaid: stats.isPaid,
        balance: stats.balance.toFixed(2),
        // Para créditos
        isCredit: sale.paymentMethod === 'credit',
        // Para pagos diferidos
        isDeferred: ['card', 'transfer', 'check'].includes(sale.paymentMethod || ''),
      }
    };
  },
  
  // Método para obtener todas las ventas enriquecidas
  getAllEnriched: async (params?: any): Promise<ApiResponse<Array<ReturnType<typeof SaleHelper.enrichSale>>>> => {
    const response = await salesService.getAll(params);
    if (response.success) {
      return {
        ...response,
        data: response.data.map(sale => SaleHelper.enrichSale(sale))
      };
    }
    return response as any;
  },
};